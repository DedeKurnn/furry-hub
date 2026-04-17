<script>
	import { resolve } from '$app/paths';
	import Squiggle from './squiggle.svelte';
</script>

<footer class="mask-fade-x relative bg-white pt-24 pb-12">
	<Squiggle />
	<div class="mt-12 px-4 text-center">
		<p>Build with sillyness by Meowcha :3</p>
		<p class="text-gray-500">with Svelte, Tailwind, and GSAP</p>
		<p class="my-4">❤️😸</p>
		<p>
			{new Date().getFullYear()} ©
			<a class="text-orange-500 hover:underline" href={resolve('/')}>furry.dikefx.com</a>
		</p>
	</div>
</footer>
