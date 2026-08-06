<script lang="ts">
	import type { Component } from 'svelte';
	import lucideIcons, { type LucideIconComponent } from './lucide-loaders';

	type IconComponent = Component<{ size?: number; strokeWidth?: number; class?: string }>;

	let {
		name,
		size = 16,
		strokeWidth = 2,
		className = ''
	} = $props<{ name?: string; size?: number; strokeWidth?: number; className?: string }>();

	const hasIcon = (value: string): value is keyof typeof lucideIcons =>
		Object.prototype.hasOwnProperty.call(lucideIcons, value);

	const resolveIcon = (iconName?: string): IconComponent | null => {
		if (!iconName) return null;
		const key = iconName.trim();
		if (!key) return null;
		if (hasIcon(key)) {
			return lucideIcons[key] as unknown as LucideIconComponent;
		}
		const kebabKey = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
		if (hasIcon(kebabKey)) {
			return lucideIcons[kebabKey] as unknown as LucideIconComponent;
		}
		const lowerKey = key.toLowerCase();
		if (hasIcon(lowerKey)) {
			return lucideIcons[lowerKey] as unknown as LucideIconComponent;
		}
		return null;
	};

	const Icon = $derived.by(() => resolveIcon(name));
</script>

{#if name}
	{#if Icon}
		<Icon {size} {strokeWidth} class={className} />
	{:else}
		<span
			class="inline-flex items-center justify-center font-bold text-xs opacity-70 {className}"
			aria-hidden="true"
		>
			{name.charAt(0).toUpperCase()}
		</span>
	{/if}
{/if}
