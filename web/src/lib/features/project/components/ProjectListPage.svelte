<script lang="ts">
	import { FolderOpen } from 'lucide-svelte';
	import PageHeader from '$lib/ui/common/PageHeader.svelte';
	import type { ProjectSummary } from '$lib/features/project/types';
	import ProjectCard from './ProjectCard.svelte';

	let { projects }: { projects: ProjectSummary[] } = $props();
</script>

<div class="mx-auto w-full max-w-5xl py-6 sm:py-10">
	<PageHeader
		title="项目"
		tag="Projects"
		subtitle="把做过的事情留下来"
		description="记录正在做的事情，也记录已经走过的路。"
	/>

	{#if projects.length > 0}
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
			{#each projects as project, index (project.slug)}
				<div class="article-enter" style={`animation-delay: ${index * 100}ms`}>
					<ProjectCard {project} />
				</div>
			{/each}
		</div>
	{:else}
		<div
			class="flex flex-col items-center justify-center gap-4 border border-dashed border-ink-200 py-24 text-center dark:border-ink-800"
		>
			<FolderOpen size={42} strokeWidth={1} class="text-ink-300 dark:text-ink-700" />
			<div class="space-y-1">
				<h2 class="font-serif text-lg text-ink-800 dark:text-ink-200">还没有项目</h2>
				<p class="text-sm text-ink-500 dark:text-ink-500">之后可以在这里记录自己的成果。</p>
			</div>
		</div>
	{/if}
</div>
