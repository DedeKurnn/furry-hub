<script>
	import Button from '$lib/components/button.svelte';
	import { SOCIALS } from '$lib/constants';
</script>

<div class="grid h-screen w-screen px-4">
	<div class="flex flex-col place-content-center items-center">
		<enhanced:img src="$lib/assets/img/meowcha.webp" class="text-st -mb-24 max-w-90" />
		<div class="max-w-160 rounded-3xl border-4 border-primary-50 bg-white p-6">
			<div class="-mt-18">
				<p class="display-stroke relative z-20 text-center font-display text-green-500">
					Welcome to
				</p>
				<h1 class="display-stroke relative z-10 text-center font-display text-5xl text-green-500">
					Meowcha's Cat Tree
				</h1>
			</div>
			<p class="mt-4 text-center">
				Heyyowww! Call me Meowcha! I'm a <span class="font-bold text-green-500"
					>green domestic cat</span
				>
				who likes to drink <span class="font-bold text-orange-800">Mocha</span> and I hate
				<span class="font-bold text-red-400">Matcha</span>. Remember that!
			</p>
		</div>
		<div class="mt-4 flex items-center gap-4">
			{#each SOCIALS as { href, icon, name }, i (i)}
				<Button text={name} as="a" rel="external" {icon} {href} />
			{/each}
		</div>
	</div>
</div>
