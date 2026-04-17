<script lang="ts" module>
	export type PaletteProps = {
		color: string;
		hex: string;
	};
</script>

<script lang="ts">
	let { color, hex }: PaletteProps = $props();
	let copied = $state<string | null>(null);
	function copyHex(hex: string) {
		navigator.clipboard.writeText(hex);
		copied = hex;

		setTimeout(() => {
			copied = null;
		}, 1500);
	}
</script>

<div
	class="group relative cursor-pointer"
	role="button"
	aria-roledescription="button"
	tabindex="0"
	onclick={() => copyHex(hex)}
	onkeydown={(e: KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ' ') {
			copyHex(hex);
		}
	}}
>
	<iconify-icon class={`text-5xl sm:text-6xl ${color}`} icon="boxicons:cat-filled"></iconify-icon>

	<div
		class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black/50 px-2 py-1 font-sniglet text-xs whitespace-nowrap text-white opacity-0 transition group-hover:opacity-100"
	>
		{copied === hex ? 'Copied!' : 'Click to copy hex'}
	</div>
</div>
