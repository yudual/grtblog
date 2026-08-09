#!/usr/bin/env bash
set -Eeuo pipefail

# Update a running VPS from immutable images built by GitHub Actions.
# Usage: ./update.sh <image-tag> [expected-build-commit]

DEPLOY_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$DEPLOY_DIR"

log() {
  printf '[update] %s\n' "$*"
}

die() {
  printf '[update] ERROR: %s\n' "$*" >&2
  exit 1
}

on_error() {
  printf '[update] Update failed. Recent app logs:\n' >&2
  compose logs --tail=80 server renderer >&2 || true
}

trap on_error ERR

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  die 'Docker Compose is not available'
fi

compose() {
  "${COMPOSE[@]}" "$@"
}

read_env_value() {
  local key="$1"
  awk -F= -v key="$key" '$1 == key { sub(/^[^=]*=/, ""); print; exit }' .env 2>/dev/null || true
}

set_env_value() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" .env; then
    sed -i "s|^${key}=.*|${key}=${value}|" .env
  else
    printf '\n%s=%s\n' "$key" "$value" >> .env
  fi
}

clear_isr_redis() {
  local pattern="${REDIS_PREFIX}isr:*"
  local lua='local cursor="0"; local removed=0; repeat local result=redis.call("SCAN", cursor, "MATCH", ARGV[1], "COUNT", 500); cursor=result[1]; for _, key in ipairs(result[2]) do removed=removed+redis.call("DEL", key); end; until cursor=="0"; return removed'

  if [[ -n "${REDIS_PASSWORD}" ]]; then
    compose exec -T -e "REDISCLI_AUTH=${REDIS_PASSWORD}" redis \
      redis-cli --no-auth-warning EVAL "$lua" 0 "$pattern" >/dev/null </dev/null
  else
    compose exec -T redis redis-cli EVAL "$lua" 0 "$pattern" >/dev/null </dev/null
  fi
}

[[ -f .env ]] || die "Missing $DEPLOY_DIR/.env"
[[ -f docker-compose.yml ]] || die "Missing $DEPLOY_DIR/docker-compose.yml"

TARGET_VERSION="${1:-}"
EXPECTED_COMMIT="${2:-}"
[[ -n "$TARGET_VERSION" ]] || die 'Usage: ./update.sh <image-tag> [expected-build-commit]'
if [[ ! "$TARGET_VERSION" =~ ^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$ ]]; then
  die 'The image tag contains unsupported characters'
fi
if [[ -n "$EXPECTED_COMMIT" && ! "$EXPECTED_COMMIT" =~ ^[0-9a-f]{40}$ ]]; then
  die 'The expected build commit must be a 40-character git SHA'
fi

IMAGE_REPO_PREFIX="${IMAGE_REPO_PREFIX:-$(read_env_value IMAGE_REPO_PREFIX)}"
IMAGE_REPO_PREFIX="${IMAGE_REPO_PREFIX:-ghcr.io/yudual/}"
REDIS_PREFIX="${REDIS_PREFIX:-$(read_env_value REDIS_PREFIX)}"
REDIS_PREFIX="${REDIS_PREFIX:-grtblog:}"
REDIS_PASSWORD="${REDIS_PASSWORD:-$(read_env_value REDIS_PASSWORD)}"
NGINX_PORT="${NGINX_PORT:-$(read_env_value NGINX_PORT)}"
NGINX_PORT="${NGINX_PORT:-80}"

export APP_VERSION="$TARGET_VERSION"
export BUILD_COMMIT="$EXPECTED_COMMIT"
export IMAGE_REPO_PREFIX
export REDIS_PREFIX REDIS_PASSWORD NGINX_PORT

server_image="${IMAGE_REPO_PREFIX}grtblog-server:${TARGET_VERSION}"
renderer_image="${IMAGE_REPO_PREFIX}grtblog-renderer:${TARGET_VERSION}"
compose_images="$(compose config --images)"
grep -Fxq "$server_image" <<< "$compose_images" || die "Compose is not configured for $server_image"
grep -Fxq "$renderer_image" <<< "$compose_images" || die "Compose is not configured for $renderer_image"

log "Pulling server and renderer images for $TARGET_VERSION"
compose pull server renderer

log 'Running migrations from the new server image'
compose run --rm --no-deps -T server sh -c 'goose -table public.goose_db_version -dir /app/migrations postgres "$DB_DSN" up' </dev/null

# Persist only deployment selectors after the new image and migrations pass.
# Credentials and site data remain untouched.
set_env_value APP_VERSION "$TARGET_VERSION"
set_env_value IMAGE_REPO_PREFIX "$IMAGE_REPO_PREFIX"
if [[ -n "$EXPECTED_COMMIT" ]]; then
  set_env_value BUILD_COMMIT "$EXPECTED_COMMIT"
fi

current_update_repo="$(read_env_value APP_UPDATE_CHECK_REPO)"
if [[ -z "$current_update_repo" || "$current_update_repo" == 'grtsinry43/grtblog' || "$current_update_repo" == 'grtsinry43/grtblog-v2' ]]; then
  set_env_value APP_UPDATE_CHECK_REPO 'yudual/grtblog'
fi

log 'Clearing ISR Redis keys and generated HTML snapshots'
clear_isr_redis
compose stop server renderer

[[ -d storage/html && ! -L storage/html ]] || die 'storage/html must be a real directory'
[[ -d storage/meta && ! -L storage/meta ]] || die 'storage/meta must be a real directory'
find storage/html -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
mkdir -p storage/html
if [[ -d storage/meta/isr && ! -L storage/meta/isr ]]; then
  find storage/meta/isr -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
fi
mkdir -p storage/meta/isr

log 'Starting the exact pulled images without a local build'
compose up -d --no-build --force-recreate server renderer

health_url="http://127.0.0.1:${NGINX_PORT}/health/readiness"
ready=0
for _ in $(seq 1 90); do
  if response="$(curl --silent --show-error --fail "$health_url" 2>/dev/null)" && [[ "$response" == *'"status":"ready"'* ]]; then
    ready=1
    break
  fi
  sleep 3
done
[[ "$ready" == 1 ]] || die "Readiness check timed out: $health_url"

for container in grtblog-server grtblog-renderer; do
  running="$(docker inspect -f '{{.State.Running}}' "$container" 2>/dev/null || true)"
  [[ "$running" == 'true' ]] || die "$container is not running"
done

if [[ -n "$EXPECTED_COMMIT" ]]; then
  renderer_commit="$(docker exec grtblog-renderer sh -c 'printf %s "$BUILD_COMMIT"')"
  [[ "$renderer_commit" == "$EXPECTED_COMMIT" ]] || die "Renderer commit mismatch: $renderer_commit"

  server_marker="$(docker exec grtblog-server sh -c "strings /app/grtblog-server | grep -F -m1 -- '$EXPECTED_COMMIT' || true")"
  [[ -n "$server_marker" ]] || die 'Server binary does not contain the expected commit'
fi

trap - ERR
log "Update complete: $server_image"
log 'Preserved storage/uploads, storage/backups, postgres_data, and redis_data'
log "Readiness: $health_url"
