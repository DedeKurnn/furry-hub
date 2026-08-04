<script lang="ts">
	import { resolve } from '$app/paths';
	import * as m from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>{m.tos_hub_title()} — Meowcha's Cat Tree</title>
	<meta name="description" content={m.tos_hub_description()} />
</svelte:head>

<section class="mt-24 sm:mt-32 pb-24 px-4">
	<h2
		class="display-stroke relative z-10 text-center font-display text-3xl text-lime-500 sm:text-5xl"
	>
		{m.tos_hub_title()}
	</h2>

	<p class="mt-4 text-center text-slate-400 font-sniglet text-base sm:text-lg max-w-xl mx-auto">
		{m.tos_hub_description()}
	</p>

	<div class="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
		<!-- Art Commission TOS Card -->
		<a
			href={resolve('/tos/art')}
			class="group relative overflow-hidden rounded-3xl border border-white/30 bg-white/10 backdrop-blur p-8
				transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-lime-400/10
				hover:border-lime-400/40 hover:bg-white/15 flex flex-col gap-4"
		>
			<div
				class="w-16 h-16 rounded-2xl bg-lime-400/20 border border-lime-400/30 flex items-center justify-center text-3xl
					transition-all duration-300 group-hover:bg-lime-400/30 group-hover:scale-110"
			>
				🎨
			</div>
			<div>
				<h3 class="font-display text-2xl text-lime-400 leading-tight">
					{m.tos_hub_art_title()}
				</h3>
				<p class="mt-2 font-sniglet text-slate-400 text-sm leading-relaxed">
					{m.tos_hub_art_desc()}
				</p>
			</div>
			<div
				class="mt-auto flex items-center gap-2 font-sniglet text-sm text-lime-500 opacity-0 -translate-x-2
					transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
			>
				<span>{m.tos_hub_read_more()}</span>
				<span>→</span>
			</div>
			<!-- Decorative glow -->
			<div
				class="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-lime-400/10 blur-2xl
					transition-all duration-500 group-hover:bg-lime-400/20 group-hover:scale-150"
			></div>
		</a>

		<!-- Fursuit Commission TOS Card -->
		<a
			href={resolve('/tos/fursuit')}
			class="group relative overflow-hidden rounded-3xl border border-white/30 bg-white/10 backdrop-blur p-8
				transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-amber-400/10
				hover:border-amber-400/40 hover:bg-white/15 flex flex-col gap-4"
		>
			<div
				class="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-3xl
					transition-all duration-300 group-hover:bg-amber-400/30 group-hover:scale-110"
			>
				🐾
			</div>
			<div>
				<h3 class="font-display text-2xl text-amber-400 leading-tight">
					{m.tos_hub_fursuit_title()}
				</h3>
				<p class="mt-2 font-sniglet text-slate-400 text-sm leading-relaxed">
					{m.tos_hub_fursuit_desc()}
				</p>
			</div>
			<div
				class="mt-auto flex items-center gap-2 font-sniglet text-sm text-amber-500 opacity-0 -translate-x-2
					transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
			>
				<span>{m.tos_hub_read_more()}</span>
				<span>→</span>
			</div>
			<!-- Decorative glow -->
			<div
				class="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-amber-400/10 blur-2xl
					transition-all duration-500 group-hover:bg-amber-400/20 group-hover:scale-150"
			></div>
		</a>
	</div>
</section>
