<script lang="ts">
	import { ArrowLeft, Calendar } from 'lucide-svelte';
	import StickyHeader from '$lib/ui/common/StickyHeader.svelte';
	import MarkdownView from '$lib/shared/markdown/MarkdownView.svelte';
	import { formatDateCN } from '$lib/shared/utils/date';
	import { resolvePath } from '$lib/shared/utils/resolve-path';
	import ProjectRelated from './ProjectRelated.svelte';
	import type { ProjectDetail as ProjectDetailData } from '$lib/features/project/types';

	let { project }: { project: ProjectDetailData } = $props();
</script>

<StickyHeader title={project.title} showCommentShortcut={false} shareButtonTitle="分享项目" />

<div class="mx-auto w-full max-w-4xl py-4 pb-16 sm:py-8 md:pb-24">
	<div
		class="mb-8 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-400 dark:text-ink-500"
	>
		<a
			href={resolvePath('/projects')}
			class="group inline-flex items-center gap-1.5 font-serif transition-colors hover:text-jade-600 dark:hover:text-jade-400"
		>
			<ArrowLeft size={14} class="transition-transform group-hover:-translate-x-0.5" />
			返回项目
		</a>
		<div class="flex flex-wrap items-center gap-3 font-mono text-[10px]">
			{#if project.status}
				<span
					class="border border-jade-500/20 bg-jade-500/5 px-2 py-1 text-jade-700 dark:text-jade-400"
				>
					{project.status}
				</span>
			{/if}
			<span class="flex items-center gap-1.5">
				<Calendar size={13} strokeWidth={1.5} />
				更新于 {formatDateCN(project.updatedAt)}
			</span>
		</div>
	</div>

	<article class="article-enter min-w-0">
		<header class="mb-10 space-y-5 border-b border-ink-200/70 pb-8 dark:border-ink-800/70">
			<h1
				class="break-words font-serif text-3xl font-bold leading-tight text-ink-950 sm:text-4xl dark:text-ink-50"
			>
				{project.title}
			</h1>
			<p class="max-w-2xl text-base leading-relaxed text-ink-500 dark:text-ink-400">
				{project.summary}
			</p>

			{#if project.cover}
				<figure
					class="overflow-hidden rounded-default border border-ink-200/70 dark:border-ink-800/70"
				>
					<img
						src={project.cover}
						alt={project.title}
						class="max-h-[32rem] w-full object-cover"
						loading="eager"
					/>
				</figure>
			{:else}
				<div class="h-px bg-ink-100 dark:bg-ink-800/60"></div>
			{/if}
		</header>

		<div
			class="markdown-body max-w-none text-[15px] leading-[1.8] text-ink-800 dark:text-ink-200 sm:text-base"
		>
			<MarkdownView content={project.content} />
		</div>

		<ProjectRelated related={project.related} />
	</article>
</div>
