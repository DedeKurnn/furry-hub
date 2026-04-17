<script lang="ts" module>
	type TitleSize = 'sm' | 'md' | 'lg';

	type SizeConfig = {
		text: string;
		stroke: string;
	};

	export type CardProps = {
		title: string;
		children: any;
		titleSize?: TitleSize;
		customClass?: string | undefined;
	};
</script>

<script lang="ts">
	let { title, children, titleSize = 'lg', customClass }: CardProps = $props();

	const sizeClasses: Record<TitleSize, SizeConfig> = {
		sm: {
			text: 'text-lg sm:text-3xl',
			stroke: 'display-stroke-xs'
		},
		md: {
			text: 'text-xl sm:text-4xl',
			stroke: 'display-stroke-sm'
		},
		lg: {
			text: 'text-3xl sm:text-5xl',
			stroke: 'display-stroke'
		}
	};

	const size = $derived(sizeClasses[titleSize as TitleSize] ?? sizeClasses.lg);
</script>

<div class={['h-fit rounded-3xl border-4 border-primary-50 bg-white p-6', customClass]}>
	<h2 class={`${size.stroke} -mt-10 font-display text-lime-500 ${size.text}`}>
		{title}
	</h2>

	{@render children?.()}
</div>
