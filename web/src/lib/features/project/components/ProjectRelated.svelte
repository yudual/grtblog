<script lang="ts">
	import { BookOpen, ExternalLink, Feather } from 'lucide-svelte';
	import type { ProjectRelatedContent } from '$lib/features/project/types';
	import { resolveHref } from '$lib/shared/utils/resolve-path';

	let { related = [] }: { related?: ProjectRelatedContent[] } = $props();
	const posts = $derived(related.filter((item) => item.kind === 'post'));
	const moments = $derived(related.filter((item) => item.kind === 'moment'));
</script>

{#if related.length > 0}
	<section class="mt-20 border-t border-ink-200/70 pt-8 dark:border-ink-800/70">
		<div class="mb-6 flex items-center gap-2">
			<span class="h-1.5 w-1.5 rounded-full bg-jade-500"></span>
			<h2 class="font-serif text-lg text-ink-900 dark:text-ink-100">相关内容</h2>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			{#each posts as item (item.href)}
				<a
					href={resolveHref(item.href)}
					class="group block rounded-default border border-ink-200/70 bg-ink-50/50 p-4 transition-colors hover:border-jade-500/40 hover:bg-white dark:border-ink-800/70 dark:bg-ink-900/30 dark:hover:bg-ink-900"
				>
					<div class="mb-3 flex items-center justify-between text-[10px] text-ink-400">
						<span class="flex items-center gap-1.5"><BookOpen size={13} />相关文章</span>
						<ExternalLink size={13} class="opacity-50 group-hover:text-jade-500" />
					</div>
					<h3
						class="font-serif text-base text-ink-800 group-hover:text-jade-700 dark:text-ink-200 dark:group-hover:text-jade-400"
					>
						{item.title}
					</h3>
					{#if item.summary}
						<p class="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-500 dark:text-ink-400">
							{item.summary}
						</p>
					{/if}
				</a>
			{/each}

			{#each moments as item (item.href)}
				<a
					href={resolveHref(item.href)}
					class="group block rounded-default border border-ink-200/70 bg-ink-50/50 p-4 transition-colors hover:border-cinnabar-500/40 hover:bg-white dark:border-ink-800/70 dark:bg-ink-900/30 dark:hover:bg-ink-900"
				>
					<div class="mb-3 flex items-center justify-between text-[10px] text-ink-400">
						<span class="flex items-center gap-1.5"><Feather size={13} />相关手记</span>
						<ExternalLink size={13} class="opacity-50 group-hover:text-cinnabar-500" />
					</div>
					<h3
						class="font-serif text-base text-ink-800 group-hover:text-cinnabar-600 dark:text-ink-200 dark:group-hover:text-cinnabar-400"
					>
						{item.title}
					</h3>
					{#if item.summary}
						<p class="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-500 dark:text-ink-400">
							{item.summary}
						</p>
					{/if}
				</a>
			{/each}
		</div>
	</section>
{/if}
