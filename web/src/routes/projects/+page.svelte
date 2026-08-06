<script lang="ts">
	import ProjectListPage from '$lib/features/project/components/ProjectListPage.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<ProjectListPage projects={data.projects} />
