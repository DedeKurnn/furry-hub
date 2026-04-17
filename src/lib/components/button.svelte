<script lang="ts" module>
	export type ButtonProps = {
		text: string;
		as?: 'a' | 'button';
		href?: string;
		onclick?: () => void;
		rel?: 'external' | undefined;
		icon?: string;
		customIcon?: string;
		customClass?: string;
	};
</script>

<script lang="ts">
	import 'iconify-icon';
	import { resolve } from '$app/paths';

	let {
		text,
		as = 'button',
		href,
		onclick,
		rel,
		icon,
		customIcon,
		customClass = ''
	}: ButtonProps = $props();

	const baseClass =
		'hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 rounded-lg border-3 border-custom-black bg-white px-4 py-2 text-center whitespace-nowrap';
</script>

{#if as === 'a' && !rel && href}
	<a href={resolve(href as any)} class={`${baseClass} ${customClass}`}>
		{#if icon}
			<iconify-icon {icon}></iconify-icon>
		{:else if customIcon}
			<img src={customIcon} alt={text} width={24} height={24} />
		{/if}
		{text}
	</a>
{:else if as === 'a' && rel === 'external'}
	<a {href} rel="external" target="_blank" class={`${baseClass} ${customClass}`}>
		{#if icon}
			<iconify-icon {icon}></iconify-icon>
		{:else if customIcon}
			<img src={customIcon} alt={text} width={24} height={24} />
		{/if}
		{text}
	</a>
{:else}
	<button class={`${baseClass} ${customClass}`} {onclick}>
		{#if icon}
			<iconify-icon {icon}></iconify-icon>
		{:else if customIcon}
			<img src={customIcon} alt={text} width={24} height={24} />
		{/if}
		{text}
	</button>
{/if}
