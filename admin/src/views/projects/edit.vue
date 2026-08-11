<script setup lang="ts">
import {
  NButton,
  NButtonGroup,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NSpin,
  NSwitch,
} from 'naive-ui'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ImageInput from '@/components/image-picker/ImageInput.vue'
import MarkdownEditor from '@/components/markdown-editor/MarkdownEditor.vue'
import MarkdownPreview from '@/components/markdown-editor/MarkdownPreview.vue'
import { createProject, getProject, updateProject } from '@/services/projects'
import { useDiscreteApi } from '@/composables/useDiscreteApi'

defineOptions({ name: 'ProjectEdit' })

const route = useRoute()
const router = useRouter()
const { message } = useDiscreteApi()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const saving = ref(false)
const showMeta = ref(false)
const showPreview = ref(true)

const form = reactive({
  title: '',
  summary: '',
  cover: '' as string | null,
  content: '',
  status: '进行中',
  shortUrl: '',
  isPublished: false,
})

const statusOptions = [
  { label: '进行中', value: '进行中' },
  { label: '已完成', value: '已完成' },
  { label: '已归档', value: '已归档' },
]

async function fetchProject() {
  if (!isEdit.value) return
  loading.value = true
  try {
    const detail = await getProject(Number(route.params.id))
    form.title = detail.title
    form.summary = detail.summary ?? ''
    form.cover = detail.cover ?? null
    form.content = detail.content
    form.status = detail.status || '进行中'
    form.shortUrl = detail.shortUrl
    form.isPublished = detail.isPublished
  } catch (err) {
    message.error(err instanceof Error ? err.message : '加载项目失败')
  } finally {
    loading.value = false
  }
}

async function save() {
  if (!form.title.trim()) {
    message.warning('请输入项目标题')
    return
  }
  saving.value = true
  try {
    const payload = {
      title: form.title,
      summary: form.summary || null,
      cover: form.cover || null,
      content: form.content,
      status: form.status,
      shortUrl: form.shortUrl || (isEdit.value ? undefined : null),
      isPublished: form.isPublished,
    }
    if (isEdit.value) {
      await updateProject(Number(route.params.id), {
        ...payload,
        shortUrl: form.shortUrl,
      })
      message.success('项目更新成功')
    } else {
      await createProject(payload)
      message.success('项目创建成功')
    }
    router.push({ name: 'projectList' })
  } catch (err) {
    message.error(err instanceof Error ? err.message : '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchProject()
})
</script>

<template>
  <div class="relative flex h-full min-h-0 flex-col">
    <div
      v-if="loading"
      class="bg-naive-body/35 absolute inset-0 z-30 grid place-items-center backdrop-blur-[1px]"
    >
      <NSpin size="large" />
    </div>

    <header
      class="z-10 flex shrink-0 flex-col gap-3 px-6 py-6 backdrop-blur sm:h-20 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-0"
    >
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <NInput
          v-model:value="form.title"
          :bordered="false"
          placeholder="输入项目标题..."
          class="flex-1 text-xl font-bold sm:text-2xl"
          :style="{ '--n-caret-color': 'var(--primary-color)', backgroundColor: 'transparent' }"
        />
      </div>

      <div class="flex shrink-0 flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
        <div class="flex items-center gap-1 text-[11px] opacity-50">
          <div class="iconify ph--link-simple" />
          <span>/projects/</span>
          <input
            v-model="form.shortUrl"
            class="w-20 border-b border-current/20 bg-transparent transition-colors outline-none focus:border-current/50 sm:w-28"
            placeholder="auto"
          />
        </div>

        <NButtonGroup size="small">
          <NButton
            :type="form.isPublished ? 'default' : 'primary'"
            :ghost="form.isPublished"
            @click="form.isPublished = false"
          >
            草稿
          </NButton>
          <NButton
            :type="form.isPublished ? 'primary' : 'default'"
            :ghost="!form.isPublished"
            @click="form.isPublished = true"
          >
            发布
          </NButton>
        </NButtonGroup>

        <NButton
          quaternary
          circle
          size="small"
          @click="showMeta = !showMeta"
        >
          <template #icon><div class="iconify ph--sliders-horizontal" /></template>
        </NButton>

        <NButton
          type="primary"
          :loading="saving"
          @click="save"
        >
          <template #icon><div class="iconify ph--floppy-disk" /></template>
          {{ isEdit ? '保存' : '创建' }}
        </NButton>
      </div>
    </header>

    <main class="flex min-h-0 flex-1 overflow-hidden">
      <div
        class="editor-container grid h-full min-h-0 w-full"
        :class="showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'"
      >
        <div class="pane editor-pane relative h-full overflow-auto">
          <MarkdownEditor
            v-model="form.content"
            class="h-full min-h-full"
          />
        </div>

        <div
          v-if="showPreview"
          class="pane preview-pane relative h-full overflow-auto"
        >
          <MarkdownPreview
            :source="form.content"
            class="p-4 sm:p-8"
          />
        </div>
      </div>
    </main>

    <NDrawer
      v-model:show="showMeta"
      placement="right"
      :width="400"
    >
      <NDrawerContent
        title="项目设置"
        :native-scrollbar="false"
        closable
      >
        <div class="flex flex-col gap-6">
          <div class="space-y-4">
            <div class="flex items-center gap-2 text-sm font-medium">
              <div class="iconify ph--image" />
              <span>封面</span>
            </div>
            <ImageInput v-model:value="form.cover" />
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-2 text-sm font-medium">
              <div class="iconify ph--gear-six" />
              <span>属性</span>
            </div>
            <NForm
              label-placement="top"
              :show-feedback="false"
              class="space-y-3"
            >
              <NFormItem label="项目状态">
                <NSelect
                  v-model:value="form.status"
                  :options="statusOptions"
                  placeholder="选择项目状态"
                />
              </NFormItem>
              <NFormItem label="摘要">
                <NInput
                  v-model:value="form.summary"
                  type="textarea"
                  placeholder="项目的一句话简介..."
                  :autosize="{ minRows: 2, maxRows: 5 }"
                />
              </NFormItem>
              <div class="flex items-center justify-between px-1 py-2">
                <span class="text-sm">发布</span>
                <NSwitch v-model:value="form.isPublished" />
              </div>
            </NForm>
          </div>
        </div>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>

<style scoped>
.pane::-webkit-scrollbar,
.editor-pane :deep(.cm-scroller::-webkit-scrollbar),
.preview-pane :deep(.markdown-preview::-webkit-scrollbar) {
  width: 5px;
  height: 5px;
}
.pane::-webkit-scrollbar-track,
.editor-pane :deep(.cm-scroller::-webkit-scrollbar-track),
.preview-pane :deep(.markdown-preview::-webkit-scrollbar-track) {
  background: transparent;
}
:global(.dark) .pane::-webkit-scrollbar-thumb,
:global(.dark) .editor-pane :deep(.cm-scroller::-webkit-scrollbar-thumb),
:global(.dark) .preview-pane :deep(.markdown-preview::-webkit-scrollbar-thumb) {
  background-color: #374151;
}
.pane::-webkit-scrollbar-thumb:hover,
.editor-pane :deep(.cm-scroller::-webkit-scrollbar-thumb:hover),
.preview-pane :deep(.markdown-preview::-webkit-scrollbar-thumb:hover) {
  background-color: #d1d5db;
}
:global(.dark) .pane::-webkit-scrollbar-thumb:hover,
:global(.dark) .editor-pane :deep(.cm-scroller::-webkit-scrollbar-thumb:hover),
:global(.dark) .preview-pane :deep(.markdown-preview::-webkit-scrollbar-thumb:hover) {
  background-color: #4b5563;
}
.editor-pane :deep(.cm-editor) {
  height: 100% !important;
  font-family: inherit;
}
.editor-pane :deep(.cm-scroller) {
  padding-bottom: 50vh;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1.6;
}
.preview-pane :deep(.markdown-preview) {
  padding-bottom: 50vh;
}
</style>
