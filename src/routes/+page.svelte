<script lang="ts">
	import Meowcha from '$lib/assets/img/meowcha.webp';
	import MeowchaPortrait from '$lib/assets/img/IMG_4580.jpeg';
	import VGenLogo from '$lib/assets/icons/vgenlogo.png';
	import Button from '$lib/components/button.svelte';
	import DottedPattern from '$lib/components/dotted-pattern.svelte';
	import Lenis from 'lenis';
	import { gsap } from 'gsap';

	import { SOCIALS, PALETTE } from '$lib/constants';
	import Palette from '$lib/components/palette.svelte';
	import Card from '$lib/components/card.svelte';

	$effect(() => {
		const lenis = new Lenis();

		lenis.on('scroll', () => ScrollTrigger.update());

		function raf(time: number) {
			lenis.raf(time * 1000);
		}

		gsap.ticker.add(raf);
		gsap.ticker.lagSmoothing(0);

		return () => {
			gsap.ticker.remove(raf);
			lenis.destroy();
		};
	});
</script>

<section
	id="hero"
	class="relative min-h-screen bg-linear-to-t from-white via-green-500/10 to-green-50/0"
>
	<div class="mask-fade-x relative w-full outline-none">
		<div class="fixed inset-0 -z-10 bg-[url('/riverbank.png')] bg-cover bg-center"></div>

		<div class="ov grid h-screen w-full overflow-hidden px-4">
			<div class="flex flex-col place-content-center items-center">
				<enhanced:img src={Meowcha} alt="Meowcha" class="text-st -mb-24 max-w-90" />
				<div class="max-w-160 rounded-3xl border-4 border-primary-50 bg-white p-6">
					<div class="-mt-18">
						<p
							class="display-stroke relative z-20 text-center font-display text-lg text-orange-500"
						>
							Welcome to
						</p>
						<h1
							class="display-stroke relative z-10 text-center font-display text-3xl text-lime-500 sm:text-5xl"
						>
							Meowcha's Cat Tree
						</h1>
					</div>
					<p class="mt-4 text-center">
						Heyyowww! wellcome to the Cat Tree! I'm Meowcha, your favorite caffeinated green cat.
						I'm here for the vibes on the little corner of the internet.
					</p>
				</div>
				<div class="mt-4 flex flex-wrap items-center justify-center gap-4">
					{#each SOCIALS as { href, icon, name }, i (i)}
						<Button text={name} as="a" rel="external" {icon} {href} />
					{/each}
				</div>
				<div class="mt-4">
					<Button
						text="Commission me on VGen :3"
						customIcon={VGenLogo}
						as="a"
						rel="external"
						href="https://vgen.co/meowchabrew"
						customClass="hover:bg-lime-500 transition-all"
					/>
				</div>
			</div>
		</div>
	</div>

	<DottedPattern />
</section>

<section id="bio" class="bg-white px-4 pt-12 pb-24">
	<div class="mx-auto grid max-w-5xl place-content-center">
		<div class="grid place-content-center gap-8 sm:grid-cols-5">
			<div class="col-span-3 grid gap-8">
				<Card title="Get to Know Me :3" titleSize="md" customClass="rotate-1">
					<p class="mt-4">
						Yes, I'm green. Yes, my name has 'Meow' in it. But if you bring Matcha near me, we’re
						going to have a problem! It’s pronounced Mocha (MOKA), like the coffee. I’m just a
						domestic house cat who stayed in the forest a little too long and started matching the
						scenery.
					</p>
				</Card>
				<div class="grid grid-cols-5 gap-8">
					<Card title="About" titleSize="md" customClass="col-span-3 -rotate-1"
						><ul class="mt-4 space-y-1">
							<li class="flex items-center gap-2">
								<span class="font-bold">Species:</span> Domestic Cat (Green Edition)
							</li>
							<li class="flex items-center gap-2">
								<span class="font-bold">Diet:</span> 90% Mocha, 10% Cauliflower
							</li>
							<li class="flex items-center gap-2">
								<span class="font-bold">Enemy #1:</span> Matcha (taste like grass)
							</li>
							<li class="flex items-center gap-2">
								<span class="font-bold">Stance:</span> Pro-Nature, Anti-Zionism
							</li>
						</ul>
					</Card>
					<Card title="Palette" titleSize="md" customClass="col-span-2 rotate-2">
						<div class="mt-2 flex flex-wrap items-center justify-center gap-1">
							{#each PALETTE as { color, hex }, i (i)}
								<Palette {color} {hex} />
							{/each}
						</div>
					</Card>
				</div>
			</div>
			<div class="col-span-2">
				<enhanced:img
					src={MeowchaPortrait}
					alt="Meowcha in Fursuit"
					class="w-full -rotate-2 rounded-3xl border-4 border-primary-50 hover:animate-wiggle"
				/>
			</div>
		</div>
	</div>
</section>
