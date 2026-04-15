<script lang="ts" module>
	import type { RouteId } from '$app/types';

	export type ButtonProps = {
		text: string;
		as?: 'a' | 'button';
		href?: RouteId | string;
		onclick?: () => void;
		rel?: 'external' | undefined;
		icon?: string;
	};
</script>

<script lang="ts">
	import { resolve } from '$app/paths';

	let { text, as = 'button', href, onclick, rel, icon }: ButtonProps = $props();
</script>

{#if as === 'a' && !rel && href}
	<a
		href={resolve(href as RouteId)}
		class="flex items-center justify-center gap-2 rounded-lg border-3 border-custom-black px-4 py-2 text-center"
	>
		<img src={icon} width={24} height={24} alt={text} />
		{text}
	</a>
{:else if as === 'a' && rel === 'external'}
	<a
		{href}
		rel="external"
		target="_blank"
		class="flex items-center justify-center gap-2 rounded-lg border-3 border-custom-black px-4 py-2 text-center"
	>
		<img src={icon} width={24} height={24} alt={text} />
		{text}
	</a>
{:else}
	<button
		class="flex items-center justify-center gap-2 rounded-lg border-3 border-custom-black px-4 py-2 text-center"
		{onclick}
	>
		<img src={icon} width={24} height={24} alt={text} />
		{text}
	</button>
{/if}
