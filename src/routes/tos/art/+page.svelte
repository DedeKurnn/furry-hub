<script lang="ts">
	import { resolve } from '$app/paths';
	import * as m from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>{m.tos_art_page_title()} — Meowcha's Cat Tree</title>
	<meta name="description" content={m.tos_art_meta_desc()} />
</svelte:head>

<section class="mt-24 sm:mt-32 pb-24">
	<!-- Back link -->
	<div class="mx-auto max-w-3xl px-4 mb-8">
		<a
			href={resolve('/tos')}
			class="inline-flex items-center gap-2 font-sniglet text-sm text-slate-400 hover:text-lime-400 transition-colors duration-200"
		>
			<span>←</span>
			<span>{m.tos_back_to_hub()}</span>
		</a>
	</div>

	<h2
		class="display-stroke relative z-10 text-center font-display text-3xl text-lime-500 sm:text-5xl"
	>
		{m.tos_title()}
	</h2>

	<article class="mt-12 prose prose-invert mx-auto max-w-3xl px-4 text-slate-500 font-sniglet">
		<h3 class="text-emerald-500">{m.tos_general_title()}</h3>
		<ul>
			<li>{m.tos_general_1()}</li>
			<li>{m.tos_general_2()}</li>
			<li>{m.tos_general_3()}</li>
		</ul>

		<h3 class="text-emerald-500">{m.tos_ordering_title()}</h3>
		<ul>
			<li>{m.tos_ordering_1()}</li>
			<li>{m.tos_ordering_2()}</li>
			<li>{m.tos_ordering_3()}</li>
			<li>{m.tos_ordering_4()}</li>
			<li>{m.tos_ordering_5()}</li>
			<li>{m.tos_ordering_6()}</li>
			<li>{m.tos_ordering_7()}</li>
		</ul>

		<h3 class="text-emerald-500">{m.tos_delivery_title()}</h3>
		<ul>
			<li>{m.tos_delivery_1()}</li>
			<li>{m.tos_delivery_2()}</li>
			<li>{m.tos_delivery_3()}</li>
		</ul>

		<h3 class="text-emerald-500">{m.tos_turnaround_title()}</h3>
		<ul>
			<li>{m.tos_turnaround_1()}</li>
			<li>{m.tos_turnaround_2()}</li>
		</ul>

		<h3 class="text-emerald-500">{m.tos_privacy_title()}</h3>
		<ul>
			<li>
				<strong class="text-slate-500">{m.tos_privacy_1_label()}</strong>
				{m.tos_privacy_1_desc()}
			</li>
			<li>
				<strong class="text-slate-500">{m.tos_privacy_2_label()}</strong>
				{m.tos_privacy_2_desc()}
			</li>
		</ul>

		<h3 class="text-emerald-500">{m.tos_copyright_artist_title()}</h3>
		<ul>
			<li>{m.tos_copyright_artist_1()}</li>
			<li>{m.tos_copyright_artist_2()}</li>
			<li>{m.tos_copyright_artist_3()}</li>
		</ul>

		<h3 class="text-emerald-500">{m.tos_copyright_client_title()}</h3>
		<ul>
			<li>{m.tos_copyright_client_1()}</li>
			<li>{m.tos_copyright_client_2()}</li>
			<li>{m.tos_copyright_client_3()}</li>
		</ul>

		<h3 class="text-emerald-500">{m.tos_blockchain_title()}</h3>
		<ul>
			<li>{m.tos_blockchain_1()}</li>
		</ul>
	</article>
</section>
