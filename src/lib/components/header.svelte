<script lang="ts">
	import { resolve } from '$app/paths';

	let expanded = $state(false);

	function toggle() {
		expanded = !expanded;
	}
</script>

<header
	class="fixed z-[999] top-4 right-4 overflow-hidden border border-white/50 backdrop-blur
		transition-[width,background-color,border-radius,box-shadow] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
		{expanded
			? 'bg-white/80 shadow-lg shadow-black/5 w-56 md:w-auto rounded-3xl md:rounded-full'
			: 'bg-white/50 hover:bg-white w-12 md:w-auto rounded-3xl md:rounded-full'}"
>
	<div class="flex items-center">
		<!-- Navigation links (horizontal, desktop only) -->
		<nav
			class="hidden md:block overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
				{expanded ? 'max-w-[600px] opacity-100' : 'max-w-0 opacity-0'}"
		>
			<ul class="flex gap-12 pl-8 pr-2 py-4 whitespace-nowrap">
				<li class="text-slate-800 transition-colors duration-200 hover:text-lime-700">
					<a href={resolve('/')}>Home</a>
				</li>
				<li class="text-slate-800 transition-colors duration-200 hover:text-lime-700">
					<a href={resolve('/commissions')}>Commissions</a>
				</li>
				<li class="text-slate-800 transition-colors duration-200 hover:text-lime-700">
					<a href={resolve('/tos')}>Terms of Service</a>
				</li>
				<li class="text-slate-800 transition-colors duration-200 hover:text-lime-700">
					<a href={resolve('/gallery')}>Gallery</a>
				</li>
			</ul>
		</nav>

		<!-- Hamburger toggle button -->
		<button
			onclick={toggle}
			class="relative z-10 flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center duration-300 ml-auto"
			aria-label={expanded ? 'Close navigation' : 'Open navigation'}
			aria-expanded={expanded}
		>
			<div class="flex w-5 flex-col items-center justify-center gap-[5px]">
				<span
					class="block h-[2px] w-5 rounded-full bg-slate-700 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
						{expanded ? 'translate-y-[7px] rotate-45' : ''}"
				></span>
				<span
					class="block h-[2px] w-5 rounded-full bg-slate-700 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
						{expanded ? 'scale-x-0 opacity-0' : 'opacity-100'}"
				></span>
				<span
					class="block h-[2px] w-5 rounded-full bg-slate-700 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
						{expanded ? '-translate-y-[7px] -rotate-45' : ''}"
				></span>
			</div>
		</button>
	</div>

	<!-- Navigation links (vertical, mobile only) -->
	<div
		class="md:hidden grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
			{expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}"
	>
		<nav class="overflow-hidden">
			<ul class="flex flex-col gap-4 px-6 pb-5 pt-1 whitespace-nowrap">
				<li class="text-slate-800 transition-colors duration-200 hover:text-lime-700">
					<a href={resolve('/')}>Home</a>
				</li>
				<li class="text-slate-800 transition-colors duration-200 hover:text-lime-700">
					<a href={resolve('/commissions')}>Commissions</a>
				</li>
				<li class="text-slate-800 transition-colors duration-200 hover:text-lime-700">
					<a href={resolve('/tos')}>Terms of Service</a>
				</li>
				<li class="text-slate-800 transition-colors duration-200 hover:text-lime-700">
					<a href={resolve('/gallery')}>Gallery</a>
				</li>
			</ul>
		</nav>
	</div>
</header>
