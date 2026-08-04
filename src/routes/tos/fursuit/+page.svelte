<script lang="ts">
	import { resolve } from '$app/paths';
	import * as m from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>{m.tos_fursuit_page_title()} — Meowcha's Cat Tree</title>
	<meta name="description" content={m.tos_fursuit_meta_desc()} />
</svelte:head>

<section class="mt-24 sm:mt-32 pb-24">
	<!-- Back link -->
	<div class="mx-auto max-w-3xl px-4 mb-8">
		<a
			href={resolve('/tos')}
			class="inline-flex items-center gap-2 font-sniglet text-sm text-slate-400 hover:text-amber-400 transition-colors duration-200"
		>
			<span>←</span>
			<span>{m.tos_back_to_hub()}</span>
		</a>
	</div>

	<h2
		class="display-stroke relative z-10 text-center font-display text-3xl text-amber-400 sm:text-5xl"
	>
		{m.tos_fursuit_title()}
	</h2>

	<p class="mt-4 text-center font-sniglet text-slate-400 text-sm max-w-xl mx-auto px-4">
		{m.tos_fursuit_consent_notice()}
	</p>

	<article class="mt-12 prose prose-invert mx-auto max-w-3xl px-4 text-slate-500 font-sniglet">
		<!-- Section 1 -->
		<h3 class="text-amber-400">{m.tos_fursuit_s1_title()}</h3>
		<ul>
			<li>
				<strong class="text-slate-400">{m.tos_fursuit_s1_age_label()}</strong>
				{m.tos_fursuit_s1_age_desc()}
			</li>
			<li>
				<strong class="text-slate-400">{m.tos_fursuit_s1_risk_label()}</strong>
				{m.tos_fursuit_s1_risk_desc()}
			</li>
			<li>
				<strong class="text-slate-400">{m.tos_fursuit_s1_copyright_label()}</strong>
				{m.tos_fursuit_s1_copyright_desc()}
			</li>
		</ul>

		<!-- Section 2 -->
		<h3 class="text-amber-400">{m.tos_fursuit_s2_title()}</h3>
		<ul>
			<li>
				<strong class="text-slate-400">{m.tos_fursuit_s2_payment_label()}</strong>
				{m.tos_fursuit_s2_payment_desc()}
			</li>
			<li>
				<strong class="text-slate-400">{m.tos_fursuit_s2_dp_label()}</strong>
				{m.tos_fursuit_s2_dp_desc()}
			</li>
			<li>
				<strong class="text-slate-400">{m.tos_fursuit_s2_final_label()}</strong>
				{m.tos_fursuit_s2_final_desc()}
			</li>
			<li>
				<strong class="text-slate-400">{m.tos_fursuit_s2_installment_label()}</strong>
				{m.tos_fursuit_s2_installment_desc()}
			</li>
			<li>
				<strong class="text-slate-400">{m.tos_fursuit_s2_ref_label()}</strong>
				{m.tos_fursuit_s2_ref_desc()}
			</li>
			<li>
				<strong class="text-slate-400">{m.tos_fursuit_s2_color_label()}</strong>
				{m.tos_fursuit_s2_color_desc()}
			</li>
		</ul>

		<!-- Section 3 -->
		<h3 class="text-amber-400">{m.tos_fursuit_s3_title()}</h3>
		<ul>
			<li>
				<strong class="text-slate-400">{m.tos_fursuit_s3_time_label()}</strong>
				{m.tos_fursuit_s3_time_desc()}
			</li>
			<li>
				<strong class="text-slate-400">{m.tos_fursuit_s3_wip_label()}</strong>
				<ul>
					<li>{m.tos_fursuit_s3_wip_1()}</li>
					<li>{m.tos_fursuit_s3_wip_2()}</li>
				</ul>
			</li>
			<li>
				<strong class="text-slate-400">{m.tos_fursuit_s3_size_label()}</strong>
				{m.tos_fursuit_s3_size_desc()}
			</li>
		</ul>

		<!-- Section 4 -->
		<h3 class="text-amber-400">{m.tos_fursuit_s4_title()}</h3>
		<ul>
			<li>
				<strong class="text-slate-400">{m.tos_fursuit_s4_shipping_label()}</strong>
				{m.tos_fursuit_s4_shipping_desc()}
			</li>
			<li>
				<strong class="text-slate-400">{m.tos_fursuit_s4_damage_label()}</strong>
				{m.tos_fursuit_s4_damage_desc()}
			</li>
			<li>
				<strong class="text-slate-400">{m.tos_fursuit_s4_warranty_label()}</strong>
				<ul>
					<li>{m.tos_fursuit_s4_warranty_1()}</li>
					<li>{m.tos_fursuit_s4_warranty_2()}</li>
					<li>{m.tos_fursuit_s4_warranty_3()}</li>
				</ul>
			</li>
		</ul>

		<!-- Section 5 -->
		<h3 class="text-amber-400">{m.tos_fursuit_s5_title()}</h3>
		<ul>
			<li>
				<strong class="text-slate-400">{m.tos_fursuit_s5_misconduct_label()}</strong>
				{m.tos_fursuit_s5_misconduct_desc()}
			</li>
			<li>
				<strong class="text-slate-400">{m.tos_fursuit_s5_cancel_maker_label()}</strong>
				{m.tos_fursuit_s5_cancel_maker_desc()}
			</li>
			<li>
				<strong class="text-slate-400">{m.tos_fursuit_s5_ghost_label()}</strong>
				{m.tos_fursuit_s5_ghost_desc()}
			</li>
		</ul>

		<!-- Section 6 -->
		<h3 class="text-amber-400">{m.tos_fursuit_s6_title()}</h3>
		<ul>
			<li>
				<strong class="text-slate-400">{m.tos_fursuit_s6_style_label()}</strong>
				{m.tos_fursuit_s6_style_desc()}
			</li>
			<li>
				<strong class="text-slate-400">{m.tos_fursuit_s6_material_label()}</strong>
				{m.tos_fursuit_s6_material_desc()}
			</li>
		</ul>
	</article>
</section>
