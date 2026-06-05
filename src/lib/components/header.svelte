<script lang="ts">
	import { resolve } from '$app/paths';
	import { getLocale, setLocale, locales } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	let expanded = $state(false);
	let langMenuOpen = $state(false);

	function toggle() {
		expanded = !expanded;
	}

	function toggleLangMenu(e: MouseEvent) {
		e.stopPropagation();
		langMenuOpen = !langMenuOpen;
	}

	function switchLocale(locale: string, e: MouseEvent) {
		e.preventDefault();
		setLocale(locale as any);
		langMenuOpen = false;
	}

	const localeLabels: Record<string, { flag: string; label: string }> = {
		en: { flag: '🇬🇧', label: 'EN' },
		id: { flag: '🇮🇩', label: 'ID' },
		de: { flag: '🇩🇪', label: 'DE' }
	};

	let currentLocale = $derived(getLocale());
</script>

<svelte:window
	onclick={() => {
		langMenuOpen = false;
	}}
/>

<!-- Wrapper: positions nav + lang toggle side by side -->
<div class="fixed z-999 top-4 right-4 flex items-start gap-2">

	
	<!-- Language selector -->
	<div class="relative">
		<button
			onclick={toggleLangMenu}
			class="flex h-12 items-center gap-1.5 rounded-full border border-white/50 bg-white/50 px-3 backdrop-blur
				transition-all duration-300 hover:bg-white hover:shadow-lg hover:shadow-black/5 cursor-pointer select-none"
			aria-label="Switch language"
			aria-expanded={langMenuOpen}
		>
			<span class="text-base leading-none">{localeLabels[currentLocale]?.flag ?? '🌐'}</span>
			<span class="text-sm font-medium text-slate-700">{localeLabels[currentLocale]?.label ?? currentLocale.toUpperCase()}</span>
			<svg
				class="h-3 w-3 text-slate-500 transition-transform duration-200 {langMenuOpen ? 'rotate-180' : ''}"
				viewBox="0 0 12 12"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>

		{#if langMenuOpen}
			<div
				class="absolute right-0 top-full mt-2 min-w-[120px] overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-lg shadow-black/10 backdrop-blur"
			>
				{#each locales as locale (locale)}
					<button
						onclick={(e) => switchLocale(locale, e)}
						class="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition-colors duration-150 hover:bg-lime-50 hover:text-lime-700 cursor-pointer
							{currentLocale === locale ? 'bg-lime-50/80 font-semibold text-lime-700' : ''}"
					>
						<span>{localeLabels[locale]?.flag ?? '🌐'}</span>
						<span>{localeLabels[locale]?.label ?? locale.toUpperCase()}</span>
					</button>
				{/each}
			</div>
		{/if}
	</div>
	
	<!-- Main nav -->
	<header
		class="overflow-hidden border border-white/50 backdrop-blur
		transition-[width,background-color,border-radius,box-shadow] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
		{expanded
			? 'bg-white/80 shadow-lg shadow-black/5 w-56 md:w-auto rounded-3xl md:rounded-full'
			: 'bg-white/50 hover:bg-white w-12 md:w-auto rounded-3xl md:rounded-full'}"
	>
		<div class="flex items-center">
			<!-- Navigation links (horizontal, desktop only) -->
			<nav
				class="hidden md:block overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
					{expanded ? 'max-w-[600px] opacity-100' : 'max-w-0 opacity-0'}"
			>
				<ul class="flex gap-12 pl-8 pr-2 py-2 whitespace-nowrap">
					<li class="text-slate-800 transition-colors duration-200 hover:text-lime-700">
						<a href={resolve('/')}>{m.nav_home()}</a>
					</li>
					<li class="text-slate-800 transition-colors duration-200 hover:text-lime-700">
						<a href={resolve('/commissions')}>{m.nav_commissions()}</a>
					</li>
					<li class="text-slate-800 transition-colors duration-200 hover:text-lime-700">
						<a href={resolve('/tos')}>{m.nav_tos()}</a>
					</li>
					<li class="text-slate-800 transition-colors duration-200 hover:text-lime-700">
						<a href={resolve('/gallery')}>{m.nav_gallery()}</a>
					</li>
				</ul>
			</nav>

			<!-- Hamburger toggle button -->
			<button
				onclick={toggle}
				class="relative z-10 flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center duration-300 ml-auto"
				aria-label={expanded ? 'Close navigation' : 'Open navigation'}
				aria-expanded={expanded}
			>
				<div class="flex w-5 flex-col items-center justify-center gap-[5px]">
					<span
						class="block h-[2px] w-5 rounded-full bg-slate-700 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
							{expanded ? 'translate-y-[7px] rotate-45' : ''}"
					></span>
					<span
						class="block h-[2px] w-5 rounded-full bg-slate-700 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
							{expanded ? 'scale-x-0 opacity-0' : 'opacity-100'}"
					></span>
					<span
						class="block h-[2px] w-5 rounded-full bg-slate-700 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
							{expanded ? '-translate-y-[7px] -rotate-45' : ''}"
					></span>
				</div>
			</button>
		</div>

		<!-- Navigation links (vertical, mobile only) -->
		<div
			class="md:hidden grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
				{expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}"
		>
			<nav class="overflow-hidden">
				<ul class="flex flex-col gap-4 px-6 pb-5 pt-1 whitespace-nowrap">
					<li class="text-slate-800 transition-colors duration-200 hover:text-lime-700">
						<a href={resolve('/')}>{m.nav_home()}</a>
					</li>
					<li class="text-slate-800 transition-colors duration-200 hover:text-lime-700">
						<a href={resolve('/commissions')}>{m.nav_commissions()}</a>
					</li>
					<li class="text-slate-800 transition-colors duration-200 hover:text-lime-700">
						<a href={resolve('/tos')}>{m.nav_tos()}</a>
					</li>
					<li class="text-slate-800 transition-colors duration-200 hover:text-lime-700">
						<a href={resolve('/gallery')}>{m.nav_gallery()}</a>
					</li>
				</ul>
			</nav>
		</div>
	</header>
</div>
