<script lang="ts">
	import * as m from '$lib/paraglide/messages';
</script>

<section class="mt-24 sm:mt-32">
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
