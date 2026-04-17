<script lang="ts">
	import gsap from 'gsap';

	let { color = '#84cc16', speed = 40, height = 40, direction = 'right', width = '4' } = $props();

	let track = $state<HTMLDivElement>();

	const segmentWidth = 100;
	const pathData = $derived(
		`M 0 ${height / 2} C 20 0, 30 0, 50 ${height / 2} S 80 ${height}, 100 ${height / 2}`
	);

	$effect(() => {
		if (!track) return;

		const segments = gsap.utils.toArray('.squiggle-segment');
		const loopWidth = segmentWidth * (segments.length / 2);
		const isRight = direction === 'right';

		gsap.set(track, { x: isRight ? -loopWidth : 0 });

		gsap.to(track, {
			x: isRight ? 0 : -loopWidth,
			duration: speed,
			ease: 'none',
			repeat: -1,
			modifiers: {
				x: gsap.utils.unitize((x) => {
					const val = parseFloat(x);
					if (isRight) {
						return val > 0 ? val - loopWidth : val;
					} else {
						return val <= -loopWidth ? val + loopWidth : val;
					}
				})
			}
		});
	});
</script>

<div class="relative w-full overflow-hidden" style:height="{height}px">
	<div bind:this={track} class="flex">
		{#each Array(40), i (i)}
			<svg
				class="squiggle-segment shrink-0"
				width={segmentWidth + 1}
				{height}
				viewBox="0 0 100 {height}"
				preserveAspectRatio="none"
				style:margin-right="-0.5px"
			>
				<path d={pathData} stroke={color} stroke-width={width} fill="none" stroke-linecap="round" />
			</svg>
		{/each}
	</div>
</div>

<style>
	.squiggle-segment {
		will-change: transform;
	}
</style>
