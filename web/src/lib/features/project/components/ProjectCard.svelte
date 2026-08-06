<script lang="ts">
	import { ArrowUpRight, Calendar, Folder } from 'lucide-svelte';
	import type { ProjectSummary } from '$lib/features/project/types';
	import { buildProjectPath } from '$lib/shared/utils/content-path';
	import { resolvePath } from '$lib/shared/utils/resolve-path';
	import { formatDateCN } from '$lib/shared/utils/date';

	let { project }: { project: ProjectSummary } = $props();
</script>

<a
	href={resolvePath(buildProjectPath(project.slug))}
	class="group block overflow-hidden rounded-default border border-ink-200/80 bg-ink-50/70 shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:border-jade-500/40 hover:bg-white hover:shadow-float dark:border-ink-800/60 dark:bg-ink-900/40 dark:hover:border-jade-500/40 dark:hover:bg-ink-900"
>
	{#if project.cover}
		<div class="aspect-[16/9] overflow-hidden border-b border-ink-200/60 dark:border-ink-800/60">
			<img
				src={project.cover}
				alt={project.title}
				class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
				loading="lazy"
			/>
		</div>
	{:else}
		<div
			class="flex aspect-[16/9] items-center justify-center border-b border-ink-200/60 bg-ink-100/70 text-ink-300 dark:border-ink-800/60 dark:bg-ink-950/50 dark:text-ink-700"
			aria-hidden="true"
		>
			<Folder size={42} strokeWidth={1} />
		</div>
	{/if}

	<div class="space-y-4 p-5 sm:p-6">
		<div
			class="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-ink-400"
		>
			<span class="flex items-center gap-1.5">
				<Calendar size={13} strokeWidth={1.5} />
				更新于 {formatDateCN(project.updatedAt)}
			</span>
			{#if project.status}
				<span
					class="border border-jade-500/20 bg-jade-500/5 px-2 py-1 text-jade-700 dark:text-jade-400"
				>
					{project.status}
				</span>
			{/if}
		</div>

		<div class="space-y-2">
			<h2
				class="font-serif text-xl font-medium text-ink-900 transition-colors group-hover:text-jade-700 dark:text-ink-100 dark:group-hover:text-jade-400"
			>
				{project.title}
			</h2>
			<p class="line-clamp-3 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
				{project.summary}
			</p>
		</div>

		<div
			class="flex items-center gap-1.5 text-xs text-ink-400 transition-colors group-hover:text-jade-600 dark:text-ink-500 dark:group-hover:text-jade-400"
		>
			<span>打开项目记录</span>
			<ArrowUpRight size={14} strokeWidth={1.5} />
		</div>
	</div>
</a>
