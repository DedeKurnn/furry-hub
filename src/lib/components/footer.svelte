<script>
	import { resolve } from '$app/paths';
	import Squiggle from './squiggle.svelte';
	import * as m from '$lib/paraglide/messages';
</script>

<footer class="mask-fade-x relative bg-white pt-24 pb-12">
	<Squiggle />
	<div class="mt-12 px-4 text-center">
		<p>{m.footer_built_by()}</p>
		<p class="text-gray-500">{m.footer_tech_stack()}</p>
		<p class="my-4">{m.footer_emoji()}</p>
		<p>
			{new Date().getFullYear()} ©
			<a class="text-orange-500 hover:underline" href={resolve('/')}>furry.dikefx.com</a>
		</p>
	</div>
</footer>
