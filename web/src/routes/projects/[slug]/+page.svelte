<script lang="ts">
	import ProjectDetail from '$lib/features/project/components/ProjectDetail.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<ProjectDetail project={data.project} />
