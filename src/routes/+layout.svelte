<script lang="ts">
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { resolve } from '$app/paths';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Footer from '$lib/components/footer.svelte';

	let { children } = $props();

	console.log(
		'%c⚡Hey dev! You found the secret console log.⚡',
		'color: yellow; font-size: 24px; font-weight: bold;'
	);
	console.log(
		"%c You\'re curious on how my website code look like huh? 👀",
		'font-size: 18px; font-weight: bold;'
	);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}

<div style="display:none">
	{#each locales as locale, i (i)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as any)}>{locale}</a>
	{/each}
</div>
<Footer />
