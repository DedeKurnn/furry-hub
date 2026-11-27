<script lang="ts">
	import { resolve } from '$app/paths';
	import * as m from '$lib/paraglide/messages';
	import type {
		CommissionFormState,
		CommissionPackage,
		CommissionSubmissionPayload,
		FingerCount,
		FurColorCount,
		FurType,
		Marking,
		PartType,
		TailSize,
		ArtisticLiberty
	} from '$lib/types/commission';
	import {
		BASE_PRICES,
		calculatePriceBreakdown,
		getActiveParts,
		detectBundleFromParts,
		sanitizeFormState,
		INITIAL_ARM_SLEEVES_DATA,
		INITIAL_FORM_STATE,
		INITIAL_HEAD_DATA,
		INITIAL_PAWS_DATA,
		INITIAL_TAIL_DATA,
		PRICE_ESTIMATE_NOTICE,
		TAIL_SIZE_NOTE,
		validateCommissionForm,
		buildSubmissionPayload,
		formatIDR
	} from '$lib/utils/commission';

	// Form State using Svelte 5 Runes
	let form: CommissionFormState = $state({
		commissionPackage: 'partial',
		selectedParts: ['head', 'paws', 'tail', 'arm_sleeves'],
		head: { ...INITIAL_HEAD_DATA },
		paws: { ...INITIAL_PAWS_DATA },
		tail: { ...INITIAL_TAIL_DATA },
		armSleeves: { ...INITIAL_ARM_SLEEVES_DATA },
		general: { ...INITIAL_FORM_STATE.general }
	});

	let errors: Record<string, string> = $state({});
	let isSubmitted = $state(false);
	let submissionPayload: CommissionSubmissionPayload | null = $state(null);
	let copySuccess = $state(false);
	let autoConvertNotice: string | null = $state(null);
	let autoConvertTimer: any = null;

	function showAutoConvertNotice(message: string) {
		autoConvertNotice = message;
		if (autoConvertTimer) clearTimeout(autoConvertTimer);
		autoConvertTimer = setTimeout(() => {
			autoConvertNotice = null;
		}, 7000);
	}

	// Reactive derived active parts and price breakdown
	const activeParts = $derived(getActiveParts(form.commissionPackage, form.selectedParts));
	const isHeadActive = $derived(activeParts.includes('head'));
	const isPawsActive = $derived(activeParts.includes('paws'));
	const isTailActive = $derived(activeParts.includes('tail'));
	const isArmSleevesActive = $derived(activeParts.includes('arm_sleeves'));

	const priceBreakdown = $derived(
		calculatePriceBreakdown(form.commissionPackage, form.selectedParts, form.tail.tailSize)
	);

	// State cleanup on package change
	function handlePackageChange(newPkg: CommissionPackage) {
		form.commissionPackage = newPkg;
		delete errors.selectedParts;

		if (newPkg === 'partial') {
			form.selectedParts = ['head', 'paws', 'tail', 'arm_sleeves'];
		} else if (newPkg === 'mini_partial') {
			form.selectedParts = ['head', 'paws', 'tail'];
			// Arm sleeves is hidden for Mini Partial -> clear values
			form.armSleeves = { ...INITIAL_ARM_SLEEVES_DATA };
			clearArmSleeveErrors();
		} else if (newPkg === 'per_parts') {
			// Per parts: only local faux fur is allowed (imported not available)
			if (form.general.furType === 'Imported furs') {
				form.general.furType = 'Local faux fur';
			}
			delete errors.furType;

			// If switching from a bundle package, reset selectedParts so user can select their desired custom parts
			if (
				(form.selectedParts.length === 4 &&
					form.selectedParts.includes('head') &&
					form.selectedParts.includes('paws') &&
					form.selectedParts.includes('tail') &&
					form.selectedParts.includes('arm_sleeves')) ||
				(form.selectedParts.length === 3 &&
					form.selectedParts.includes('head') &&
					form.selectedParts.includes('paws') &&
					form.selectedParts.includes('tail'))
			) {
				form.selectedParts = [];
			}

			// Per parts: only checked parts retain data, uncheck clears hidden parts
			if (!form.selectedParts.includes('head')) {
				form.head = { ...INITIAL_HEAD_DATA };
				clearHeadErrors();
			}
			if (!form.selectedParts.includes('paws')) {
				form.paws = { ...INITIAL_PAWS_DATA };
				delete errors.fingerCount;
			}
			if (!form.selectedParts.includes('tail')) {
				form.tail = { ...INITIAL_TAIL_DATA };
				clearTailErrors();
			}
			if (!form.selectedParts.includes('arm_sleeves')) {
				form.armSleeves = { ...INITIAL_ARM_SLEEVES_DATA };
				clearArmSleeveErrors();
			}
		}
	}

	// State cleanup on individual part toggle + auto bundle conversion
	function togglePart(part: PartType) {
		const exists = form.selectedParts.includes(part);
		let nextParts: PartType[];

		if (exists) {
			nextParts = form.selectedParts.filter((p: PartType) => p !== part);
			// Clean hidden section values immediately
			if (part === 'head') {
				form.head = { ...INITIAL_HEAD_DATA };
				clearHeadErrors();
			} else if (part === 'paws') {
				form.paws = { ...INITIAL_PAWS_DATA };
				delete errors.fingerCount;
			} else if (part === 'tail') {
				form.tail = { ...INITIAL_TAIL_DATA };
				clearTailErrors();
			} else if (part === 'arm_sleeves') {
				form.armSleeves = { ...INITIAL_ARM_SLEEVES_DATA };
				clearArmSleeveErrors();
			}
		} else {
			nextParts = [...form.selectedParts, part];
			delete errors.selectedParts;
		}

		// Automatic bundle conversion:
		// head, paws, tail, arm_sleeves -> convert to Partial
		// head, paws, tail -> convert to Mini Partial
		const detectedBundle = detectBundleFromParts(nextParts);
		if (detectedBundle === 'partial') {
			form.commissionPackage = 'partial';
			form.selectedParts = ['head', 'paws', 'tail', 'arm_sleeves'];
			showAutoConvertNotice(
				'Your selection includes all parts (Head, Paws, Tail, Arm Sleeves) and was automatically converted to the Partial bundle!'
			);
			return;
		}

		if (detectedBundle === 'mini_partial') {
			form.commissionPackage = 'mini_partial';
			form.selectedParts = ['head', 'paws', 'tail'];
			form.armSleeves = { ...INITIAL_ARM_SLEEVES_DATA };
			clearArmSleeveErrors();
			showAutoConvertNotice(
				'Your selection (Head, Paws, Tail) was automatically converted to the Mini Partial bundle!'
			);
			return;
		}

		form.selectedParts = nextParts;
	}

	function clearHeadErrors() {
		delete errors.headCircumference;
		delete errors.headHeight;
	}

	function clearTailErrors() {
		delete errors.tailSize;
	}

	function clearArmSleeveErrors() {
		delete errors.armLength;
		delete errors.upperArmCircumference;
		delete errors.wristWidth;
	}

	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			form.general.refSheetFileName = file.name;
			const reader = new FileReader();
			reader.onload = (e) => {
				form.general.refSheetUrl = e.target?.result as string;
				delete errors.refSheet;
			};
			reader.readAsDataURL(file);
		}
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		// Sanitize form state first (handles auto-conversions if any)
		form = sanitizeFormState(form);

		const validation = validateCommissionForm(form);
		if (!validation.isValid) {
			errors = validation.errors;
			const firstErrorEl = document.querySelector('[data-error="true"]');
			if (firstErrorEl) {
				firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
			return;
		}

		// Validation passed: build sanitized payload with hidden fields stripped
		errors = {};
		submissionPayload = buildSubmissionPayload(form);
		isSubmitted = true;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function handleReset() {
		form = {
			commissionPackage: 'partial',
			selectedParts: ['head', 'paws', 'tail', 'arm_sleeves'],
			head: { ...INITIAL_HEAD_DATA },
			paws: { ...INITIAL_PAWS_DATA },
			tail: { ...INITIAL_TAIL_DATA },
			armSleeves: { ...INITIAL_ARM_SLEEVES_DATA },
			general: { ...INITIAL_FORM_STATE.general }
		};
		errors = {};
		autoConvertNotice = null;
		if (autoConvertTimer) clearTimeout(autoConvertTimer);
		isSubmitted = false;
		submissionPayload = null;
		copySuccess = false;
	}

	async function copyPayloadToClipboard() {
		if (!submissionPayload) return;
		try {
			await navigator.clipboard.writeText(JSON.stringify(submissionPayload, null, 2));
			copySuccess = true;
			setTimeout(() => {
				copySuccess = false;
			}, 3000);
		} catch (err) {
			console.error('Failed to copy', err);
		}
	}
</script>

<svelte:head>
	<title>{m.commissions_title()} Quote Form — Meowcha's Cat Tree</title>
	<meta
		name="description"
		content="Estimate your custom fursuit commission quote with our interactive pricing form."
	/>
</svelte:head>

<section class="mx-auto mt-20 max-w-7xl px-4 pb-24 sm:mt-28">
	<!-- Page Header -->
	<div class="mb-8 text-center">
		<h1
			class="display-stroke relative z-10 text-center font-display text-4xl text-lime-500 sm:text-6xl"
		>
			{m.commissions_title()}
		</h1>
		<p class="mx-auto mt-2 max-w-2xl font-sniglet text-lg text-slate-600 sm:text-xl">
			Instant Fursuit Commission Quote Calculator
		</p>
	</div>

	<!-- Studio Scope Banner -->
	<div
		class="mb-10 rounded-3xl border-4 border-amber-300 bg-amber-50/90 p-5 text-slate-800 shadow-sm"
	>
		<div class="mb-2 flex items-center gap-3">
			<span class="text-2xl">✨</span>
			<h2 class="font-display text-xl tracking-wide text-amber-700">Studio Scope & Standards</h2>
		</div>
		<div class="grid grid-cols-1 gap-3 font-sniglet text-sm sm:grid-cols-2 md:grid-cols-4">
			<div class="rounded-xl border border-amber-200 bg-white/80 p-3">
				<span class="mb-0.5 block font-bold text-amber-800">🎨 Style</span>
				<span><strong>Toony only</strong> (no kemono, no realistic)</span>
			</div>
			<div class="rounded-xl border border-amber-200 bg-white/80 p-3">
				<span class="mb-0.5 block font-bold text-amber-800">🐾 Head Base</span>
				<span><strong>Foam base only</strong>, fully lined, no moving jaw</span>
			</div>
			<div class="rounded-xl border border-amber-200 bg-white/80 p-3">
				<span class="mb-0.5 block font-bold text-amber-800">🧤 Paws Style</span>
				<span><strong>Toony only</strong> (4 or 5 finger)</span>
			</div>
			<div class="rounded-xl border border-amber-200 bg-white/80 p-3">
				<span class="mb-0.5 block font-bold text-amber-800">✂️ Offered Parts</span>
				<span>Head, Paws, Tail, Arm Sleeves</span>
			</div>
		</div>
	</div>

	{#if isSubmitted && submissionPayload}
		<!-- Submission Confirmation View -->
		<div
			class="mx-auto max-w-3xl rounded-3xl border-4 border-lime-400 bg-white p-6 text-slate-800 shadow-lg sm:p-10"
		>
			<div class="mb-6 text-center">
				<span class="mb-2 inline-block text-5xl">🎉</span>
				<h2 class="font-display text-3xl text-lime-600 sm:text-4xl">Quote Request Generated!</h2>
				<p class="mt-2 font-sniglet text-slate-600">
					Here is your estimated commission quote summary and clean submission data.
				</p>
			</div>

			<!-- Price Card in Summary -->
			<div class="mb-6 rounded-2xl border-3 border-lime-300 bg-lime-50/70 p-5 text-center">
				<span class="font-sniglet text-sm font-bold tracking-wider text-lime-800 uppercase">
					Estimated Base Price
				</span>
				<div class="my-1 font-display text-4xl text-lime-600 sm:text-5xl">
					{submissionPayload.formattedPrice}
				</div>
				<p class="mx-auto max-w-md font-sniglet text-xs text-slate-500 italic">
					*{PRICE_ESTIMATE_NOTICE}*
				</p>
			</div>

			<!-- Overview details -->
			<div class="mb-6 grid grid-cols-1 gap-4 font-sniglet text-sm sm:grid-cols-2">
				<div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
					<h3 class="mb-2 font-bold text-slate-700">📋 Commission Details</h3>
					<p>
						<span class="text-slate-500">Package:</span>
						<strong>{submissionPayload.commissionPackage}</strong>
					</p>
					<p>
						<span class="text-slate-500">Character:</span>
						<strong>{submissionPayload.general.characterNameSpecies}</strong>
					</p>
					<p>
						<span class="text-slate-500">Fur Type:</span>
						<strong>{submissionPayload.general.furType}</strong>
					</p>
					<p>
						<span class="text-slate-500">Fur Colors:</span>
						<strong>{submissionPayload.general.furColorCount}</strong>
					</p>
					<p>
						<span class="text-slate-500">Markings:</span>
						<strong>{submissionPayload.general.markings || 'None'}</strong>
					</p>
					<p>
						<span class="text-slate-500">Active Parts:</span>
						<strong>{submissionPayload.activeParts.join(', ')}</strong>
					</p>
				</div>
				<div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
					<h3 class="mb-2 font-bold text-slate-700">📬 Contact Details</h3>
					<p>
						<span class="text-slate-500">Client:</span>
						<strong>{submissionPayload.general.contactName}</strong>
					</p>
					<p>
						<span class="text-slate-500">{submissionPayload.general.contactMethod}:</span>
						<strong>{submissionPayload.general.contactValue}</strong>
					</p>
					<p>
						<span class="text-slate-500">Destination:</span>
						<strong>{submissionPayload.general.shippingDestination}</strong>
					</p>
					<p>
						<span class="text-slate-500">Terms Agreed:</span>
						<strong class="text-lime-600">Yes (18+)</strong>
					</p>
				</div>
			</div>

			<!-- Part specifics included in payload -->
			<div class="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 font-sniglet text-sm">
				<h3 class="mb-2 font-bold text-slate-700">📐 Included Specifications</h3>
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{#if submissionPayload.head}
						<div class="rounded-xl border border-slate-200 bg-white p-3">
							<strong>Head:</strong>
							<ul class="mt-1 list-inside list-disc space-y-0.5 text-xs text-slate-600">
								<li>Circumference: {submissionPayload.head.headCircumference} cm</li>
								<li>Height: {submissionPayload.head.headHeight} cm</li>
								{#if submissionPayload.head.headAddons}
									<li>Add-ons: {submissionPayload.head.headAddons}</li>
								{/if}
							</ul>
						</div>
					{/if}

					{#if submissionPayload.paws}
						<div class="rounded-xl border border-slate-200 bg-white p-3">
							<strong>Paws:</strong>
							<ul class="mt-1 list-inside list-disc space-y-0.5 text-xs text-slate-600">
								<li>Finger Count: {submissionPayload.paws.fingerCount}</li>
							</ul>
						</div>
					{/if}

					{#if submissionPayload.tail}
						<div class="rounded-xl border border-slate-200 bg-white p-3">
							<strong>Tail:</strong>
							<ul class="mt-1 list-inside list-disc space-y-0.5 text-xs text-slate-600">
								<li>Size: {submissionPayload.tail.tailSize}</li>
							</ul>
						</div>
					{/if}

					{#if submissionPayload.armSleeves}
						<div class="rounded-xl border border-slate-200 bg-white p-3">
							<strong>Arm Sleeves:</strong>
							<ul class="mt-1 list-inside list-disc space-y-0.5 text-xs text-slate-600">
								<li>Arm Length: {submissionPayload.armSleeves.armLength} cm</li>
								<li>Upper Arm: {submissionPayload.armSleeves.upperArmCircumference} cm</li>
								<li>Wrist Width: {submissionPayload.armSleeves.wristWidth} cm</li>
							</ul>
						</div>
					{/if}
				</div>
			</div>

			<!-- Clean JSON Payload Preview -->
			<div class="mb-6">
				<div class="mb-2 flex items-center justify-between">
					<span class="font-sniglet text-xs font-bold text-slate-500 uppercase">
						Sanitized Payload (Hidden fields removed)
					</span>
					<button
						type="button"
						onclick={copyPayloadToClipboard}
						class="cursor-pointer rounded-lg bg-lime-100 px-3 py-1 font-sniglet text-xs text-lime-800 transition-colors hover:bg-lime-200"
					>
						{copySuccess ? 'Copied to Clipboard! ✓' : 'Copy JSON 📋'}
					</button>
				</div>
				<pre
					class="max-h-56 overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-xs leading-relaxed text-lime-300">{JSON.stringify(
						submissionPayload,
						null,
						2
					)}</pre>
			</div>

			<!-- Action buttons -->
			<div class="flex flex-col justify-center gap-3 sm:flex-row">
				<button
					type="button"
					onclick={handleReset}
					class="cursor-pointer rounded-xl border-3 border-slate-700 bg-white px-6 py-3 text-center font-sniglet font-bold text-slate-700 transition-all hover:bg-slate-100"
				>
					Start Another Quote
				</button>
				<a
					href={resolve('/tos/fursuit')}
					class="rounded-xl border-3 border-amber-400 bg-amber-400 px-6 py-3 text-center font-sniglet font-bold text-slate-900 transition-all hover:bg-amber-500"
				>
					View Fursuit TOS 🐾
				</a>
			</div>
		</div>
	{:else}
		<!-- Main Form Layout: 2 Columns on Large Screens -->
		<div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
			<!-- LEFT COLUMN: The Interactive Form (Cols 1-8) -->
			<form onsubmit={handleSubmit} novalidate class="flex flex-col gap-8 lg:col-span-8">
				<!-- Global Form Error Banner (if validation failed) -->
				{#if Object.keys(errors).length > 0}
					<div
						class="rounded-2xl border-2 border-red-300 bg-red-50 p-4 font-sniglet text-sm text-red-700"
						role="alert"
					>
						<p class="flex items-center gap-2 font-bold">
							<span>⚠️</span> Please fix the following errors before submitting:
						</p>
						<ul class="mt-2 list-inside list-disc space-y-1">
							{#each Object.entries(errors) as [field, msg]}
								<li>{msg}</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if autoConvertNotice}
					<div
						class="flex items-center justify-between rounded-2xl border-2 border-lime-400 bg-lime-50 p-4 text-lime-900 shadow-sm"
						role="status"
					>
						<div class="flex items-center gap-3">
							<span class="text-2xl">✨</span>
							<div>
								<p class="font-sniglet text-sm font-bold text-lime-800">
									Automatic Bundle Conversion
								</p>
								<p class="font-sniglet text-xs text-lime-700">{autoConvertNotice}</p>
							</div>
						</div>
						<button
							type="button"
							onclick={() => (autoConvertNotice = null)}
							class="cursor-pointer px-2 py-1 font-sniglet text-xs font-bold text-slate-400 hover:text-slate-600"
							aria-label="Dismiss notice"
						>
							✕
						</button>
					</div>
				{/if}

				<!-- STEP 1: Commission Package (Always visible) -->
				<section
					class="rounded-3xl border-4 border-primary-50 bg-white p-6 shadow-sm"
					aria-labelledby="step1-title"
				>
					<div class="mb-4 flex items-center gap-3">
						<span
							class="flex h-8 w-8 items-center justify-center rounded-full bg-lime-500 font-sniglet text-sm font-bold text-white"
						>
							1
						</span>
						<h2 id="step1-title" class="font-display text-2xl text-lime-600">Commission Package</h2>
					</div>
					<p class="mb-4 font-sniglet text-sm text-slate-600">
						Choose your base fursuit commission package.
					</p>

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<!-- Partial -->
						<label
							class={[
								'relative flex cursor-pointer flex-col justify-between rounded-2xl border-3 p-4 transition-all',
								form.commissionPackage === 'partial'
									? 'border-lime-500 bg-lime-50/50 shadow-md ring-2 ring-lime-400/30'
									: 'border-slate-200 bg-white hover:border-lime-300'
							]}
						>
							<input
								type="radio"
								name="commissionPackage"
								value="partial"
								checked={form.commissionPackage === 'partial'}
								onchange={() => handlePackageChange('partial')}
								class="sr-only"
							/>
							<div>
								<div class="flex items-center justify-between">
									<span class="font-display text-xl text-slate-800">Partial</span>
									<span
										class={[
											'flex h-5 w-5 items-center justify-center rounded-full border-2 text-xs',
											form.commissionPackage === 'partial'
												? 'border-lime-600 bg-lime-500 text-white'
												: 'border-slate-300'
										]}
									>
										{#if form.commissionPackage === 'partial'}✓{/if}
									</span>
								</div>
								<p class="mt-1 font-sniglet text-xs text-slate-500">
									Head, Paws, Tail, Arm Sleeves
								</p>
							</div>
							<div class="mt-4 border-t border-slate-200 pt-2">
								<span class="font-sniglet font-bold text-lime-700">
									{formatIDR(BASE_PRICES.partial)}
								</span>
							</div>
						</label>

						<!-- Mini Partial -->
						<label
							class={[
								'relative flex cursor-pointer flex-col justify-between rounded-2xl border-3 p-4 transition-all',
								form.commissionPackage === 'mini_partial'
									? 'border-lime-500 bg-lime-50/50 shadow-md ring-2 ring-lime-400/30'
									: 'border-slate-200 bg-white hover:border-lime-300'
							]}
						>
							<input
								type="radio"
								name="commissionPackage"
								value="mini_partial"
								checked={form.commissionPackage === 'mini_partial'}
								onchange={() => handlePackageChange('mini_partial')}
								class="sr-only"
							/>
							<div>
								<div class="flex items-center justify-between">
									<span class="font-display text-xl text-slate-800">Mini Partial</span>
									<span
										class={[
											'flex h-5 w-5 items-center justify-center rounded-full border-2 text-xs',
											form.commissionPackage === 'mini_partial'
												? 'border-lime-600 bg-lime-500 text-white'
												: 'border-slate-300'
										]}
									>
										{#if form.commissionPackage === 'mini_partial'}✓{/if}
									</span>
								</div>
								<p class="mt-1 font-sniglet text-xs text-slate-500">
									Head, Paws, Tail (No Sleeves)
								</p>
							</div>
							<div class="mt-4 border-t border-slate-200 pt-2">
								<span class="font-sniglet font-bold text-lime-700">
									{formatIDR(BASE_PRICES.mini_partial)}
								</span>
							</div>
						</label>

						<!-- Per Parts -->
						<label
							class={[
								'relative flex cursor-pointer flex-col justify-between rounded-2xl border-3 p-4 transition-all',
								form.commissionPackage === 'per_parts'
									? 'border-lime-500 bg-lime-50/50 shadow-md ring-2 ring-lime-400/30'
									: 'border-slate-200 bg-white hover:border-lime-300'
							]}
						>
							<input
								type="radio"
								name="commissionPackage"
								value="per_parts"
								checked={form.commissionPackage === 'per_parts'}
								onchange={() => handlePackageChange('per_parts')}
								class="sr-only"
							/>
							<div>
								<div class="flex items-center justify-between">
									<span class="font-display text-xl text-slate-800">Per Parts</span>
									<span
										class={[
											'flex h-5 w-5 items-center justify-center rounded-full border-2 text-xs',
											form.commissionPackage === 'per_parts'
												? 'border-lime-600 bg-lime-500 text-white'
												: 'border-slate-300'
										]}
									>
										{#if form.commissionPackage === 'per_parts'}✓{/if}
									</span>
								</div>
								<p class="mt-1 font-sniglet text-xs text-slate-500">Select specific custom parts</p>
							</div>
							<div class="mt-4 border-t border-slate-200 pt-2">
								<span class="font-sniglet font-bold text-lime-700">Custom Sum</span>
							</div>
						</label>
					</div>
				</section>

				<!-- STEP 2: Per Parts selector (Visible ONLY when package is Per Parts) -->
				{#if form.commissionPackage === 'per_parts'}
					<section
						class="rounded-3xl border-4 border-primary-50 bg-white p-6 shadow-sm transition-all"
						data-error={!!errors.selectedParts}
					>
						<div class="mb-2 flex items-center gap-3">
							<span
								class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 font-sniglet text-sm font-bold text-white"
							>
								2
							</span>
							<h2 class="font-display text-2xl text-amber-600">Per Parts Selector</h2>
						</div>
						<p class="mb-4 font-sniglet text-sm text-slate-600">
							Check each part you would like to include in your commission:
						</p>
						<div class="mb-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3">
							<p class="font-sniglet text-xs text-amber-900">
								💡 <strong>Bundle Note:</strong> Selecting <em>Head + Paws + Tail</em> will
								automatically convert to the <strong>Mini Partial</strong> bundle, and selecting
								<em>all 4 parts</em>
								will automatically convert to the <strong>Partial</strong> bundle for better bundled pricing!
							</p>
						</div>
						<div class="mb-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3">
							<p class="font-sniglet text-xs text-amber-900">
								💡 <strong>Bundle Note:</strong> Selecting <em>Head + Paws + Tail</em> will automatically convert to the <strong>Mini Partial</strong> bundle, and selecting <em>all 4 parts</em> will automatically convert to the <strong>Partial</strong> bundle for better bundled pricing!
							</p>
						</div>

						{#if errors.selectedParts}
							<p class="mb-3 font-sniglet text-xs font-bold text-red-600">
								⚠️ {errors.selectedParts}
							</p>
						{/if}

						<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
							<!-- Head -->
							<button
								type="button"
								onclick={() => togglePart('head')}
								class={[
									'flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-3 text-left font-sniglet transition-all',
									form.selectedParts.includes('head')
										? 'border-amber-500 bg-amber-50/70 shadow-sm'
										: 'border-slate-200 bg-white opacity-70 hover:opacity-100'
								]}
							>
								<div class="mb-1 flex items-center justify-between">
									<span class="font-bold text-slate-800">Head</span>
									<span
										class={[
											'flex h-4 w-4 items-center justify-center rounded border text-xs',
											form.selectedParts.includes('head')
												? 'border-amber-600 bg-amber-500 text-white'
												: 'border-slate-300'
										]}
									>
										{#if form.selectedParts.includes('head')}✓{/if}
									</span>
								</div>
								<span class="text-xs font-bold text-amber-800">
									{formatIDR(BASE_PRICES.per_parts.head)}
								</span>
							</button>

							<!-- Paws -->
							<button
								type="button"
								onclick={() => togglePart('paws')}
								class={[
									'flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-3 text-left font-sniglet transition-all',
									form.selectedParts.includes('paws')
										? 'border-amber-500 bg-amber-50/70 shadow-sm'
										: 'border-slate-200 bg-white opacity-70 hover:opacity-100'
								]}
							>
								<div class="mb-1 flex items-center justify-between">
									<span class="font-bold text-slate-800">Paws</span>
									<span
										class={[
											'flex h-4 w-4 items-center justify-center rounded border text-xs',
											form.selectedParts.includes('paws')
												? 'border-amber-600 bg-amber-500 text-white'
												: 'border-slate-300'
										]}
									>
										{#if form.selectedParts.includes('paws')}✓{/if}
									</span>
								</div>
								<span class="text-xs font-bold text-amber-800">
									{formatIDR(BASE_PRICES.per_parts.paws)}
								</span>
							</button>

							<!-- Tail -->
							<button
								type="button"
								onclick={() => togglePart('tail')}
								class={[
									'flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-3 text-left font-sniglet transition-all',
									form.selectedParts.includes('tail')
										? 'border-amber-500 bg-amber-50/70 shadow-sm'
										: 'border-slate-200 bg-white opacity-70 hover:opacity-100'
								]}
							>
								<div class="mb-1 flex items-center justify-between">
									<span class="font-bold text-slate-800">Tail</span>
									<span
										class={[
											'flex h-4 w-4 items-center justify-center rounded border text-xs',
											form.selectedParts.includes('tail')
												? 'border-amber-600 bg-amber-500 text-white'
												: 'border-slate-300'
										]}
									>
										{#if form.selectedParts.includes('tail')}✓{/if}
									</span>
								</div>
								<span class="text-xs font-bold text-amber-800">
									{formatIDR(BASE_PRICES.per_parts.tail)}
								</span>
							</button>

							<!-- Arm Sleeves -->
							<button
								type="button"
								onclick={() => togglePart('arm_sleeves')}
								class={[
									'flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-3 text-left font-sniglet transition-all',
									form.selectedParts.includes('arm_sleeves')
										? 'border-amber-500 bg-amber-50/70 shadow-sm'
										: 'border-slate-200 bg-white opacity-70 hover:opacity-100'
								]}
							>
								<div class="mb-1 flex items-center justify-between">
									<span class="font-bold text-slate-800">Arm Sleeves</span>
									<span
										class={[
											'flex h-4 w-4 items-center justify-center rounded border text-xs',
											form.selectedParts.includes('arm_sleeves')
												? 'border-amber-600 bg-amber-500 text-white'
												: 'border-slate-300'
										]}
									>
										{#if form.selectedParts.includes('arm_sleeves')}✓{/if}
									</span>
								</div>
								<span class="text-xs font-bold text-amber-800">
									{formatIDR(BASE_PRICES.per_parts.arm_sleeves)}
								</span>
							</button>
						</div>
					</section>
				{/if}

				<!-- STEP 3: Part Sections -->

				<!-- Section A: Head -->
				{#if isHeadActive}
					<section
						class="rounded-3xl border-4 border-primary-50 bg-white p-6 shadow-sm"
						aria-labelledby="head-section-title"
					>
						<div class="mb-4 flex items-center gap-2">
							<span class="text-2xl">🐱</span>
							<h3 id="head-section-title" class="font-display text-2xl text-lime-600">
								Head Details
							</h3>
							<span
								class="ml-auto rounded-full bg-lime-100 px-2 py-0.5 font-sniglet text-xs font-bold text-lime-800"
							>
								Foam Base Only • Fully Lined • Static Jaw
							</span>
						</div>

						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<!-- Head Circumference (cm) -->
							<div data-error={!!errors.headCircumference}>
								<label
									for="input-head-circ"
									class="mb-1 block font-sniglet text-sm font-bold text-slate-700"
								>
									Head Circumference (cm) <span class="text-red-500">*</span>
								</label>
								<input
									id="input-head-circ"
									type="number"
									min="40"
									max="80"
									step="0.5"
									placeholder="e.g. 56"
									bind:value={form.head.headCircumference}
									oninput={() => delete errors.headCircumference}
									class="w-full rounded-xl border-2 border-slate-200 p-2.5 font-sniglet text-sm focus:border-lime-500 focus:ring-0"
								/>
								{#if errors.headCircumference}
									<p class="mt-1 font-sniglet text-xs text-red-500">{errors.headCircumference}</p>
								{/if}
							</div>

							<!-- Head Height (cm) -->
							<div data-error={!!errors.headHeight}>
								<label
									for="input-head-height"
									class="mb-1 block font-sniglet text-sm font-bold text-slate-700"
								>
									Head Height (cm) <span class="text-red-500">*</span>
								</label>
								<input
									id="input-head-height"
									type="number"
									min="15"
									max="50"
									step="0.5"
									placeholder="e.g. 25"
									bind:value={form.head.headHeight}
									oninput={() => delete errors.headHeight}
									class="w-full rounded-xl border-2 border-slate-200 p-2.5 font-sniglet text-sm focus:border-lime-500 focus:ring-0"
								/>
								{#if errors.headHeight}
									<p class="mt-1 font-sniglet text-xs text-red-500">{errors.headHeight}</p>
								{/if}
							</div>

							<!-- Head Add-ons -->
							<div class="sm:col-span-2">
								<label
									for="input-head-addons"
									class="mb-1 block font-sniglet text-sm font-bold text-slate-700"
								>
									Head Add-ons <span class="text-xs font-normal text-slate-400"
										>(optional, priced manually)</span
									>
								</label>
								<input
									id="input-head-addons"
									type="text"
									placeholder="e.g. Piercings, magnetic tongue, plush horns, hair tuft..."
									bind:value={form.head.headAddons}
									class="w-full rounded-xl border-2 border-slate-200 p-2.5 font-sniglet text-sm focus:border-lime-500 focus:ring-0"
								/>
							</div>
						</div>
					</section>
				{/if}

				<!-- Section B: Paws -->
				{#if isPawsActive}
					<section
						class="rounded-3xl border-4 border-primary-50 bg-white p-6 shadow-sm"
						aria-labelledby="paws-section-title"
					>
						<div class="mb-4 flex items-center gap-2">
							<span class="text-2xl">🐾</span>
							<h3 id="paws-section-title" class="font-display text-2xl text-lime-600">
								Paws Details
							</h3>
							<span
								class="ml-auto rounded-full bg-lime-100 px-2 py-0.5 font-sniglet text-xs font-bold text-lime-800"
							>
								Toony Only
							</span>
						</div>

						<div data-error={!!errors.fingerCount}>
							<span class="mb-1 block font-sniglet text-sm font-bold text-slate-700">
								Finger Count <span class="text-red-500">*</span>
							</span>
							<div class="grid max-w-md grid-cols-2 gap-3">
								{#each ['4-Finger', '5-Finger'] as FingerCount[] as count}
									<label
										class={[
											'cursor-pointer rounded-xl border-2 p-3 text-center font-sniglet text-sm font-bold transition-all',
											form.paws.fingerCount === count
												? 'border-lime-500 bg-lime-50 text-lime-800 shadow-sm'
												: 'border-slate-200 text-slate-600 hover:border-slate-300'
										]}
									>
										<input
											type="radio"
											name="fingerCount"
											value={count}
											checked={form.paws.fingerCount === count}
											onchange={() => {
												form.paws.fingerCount = count;
												delete errors.fingerCount;
											}}
											class="sr-only"
										/>
										{count}
									</label>
								{/each}
							</div>
							{#if errors.fingerCount}
								<p class="mt-1 font-sniglet text-xs text-red-500">{errors.fingerCount}</p>
							{/if}
						</div>
					</section>
				{/if}

				<!-- Section C: Tail -->
				{#if isTailActive}
					<section
						class="rounded-3xl border-4 border-primary-50 bg-white p-6 shadow-sm"
						aria-labelledby="tail-section-title"
					>
						<div class="mb-4 flex items-center gap-2">
							<span class="text-2xl">🦊</span>
							<h3 id="tail-section-title" class="font-display text-2xl text-lime-600">
								Tail Details
							</h3>
						</div>

						<div class="space-y-4">
							<!-- Tail Size -->
							<div data-error={!!errors.tailSize}>
								<div class="mb-1 flex items-baseline justify-between">
									<span class="font-sniglet text-sm font-bold text-slate-700">
										Tail Size <span class="text-red-500">*</span>
									</span>
								</div>
								<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
									{#each [{ label: 'Nub / Small', note: '−20% (−Rp 120.000)' }, { label: 'Standard', note: 'Standard price' }, { label: 'Floor-Dragger', note: '+20% (+Rp 120.000)' }] as const as option}
										<label
											class={[
												'cursor-pointer rounded-xl border-2 p-3 text-center transition-all',
												form.tail.tailSize === option.label
													? 'border-lime-500 bg-lime-50 shadow-sm'
													: 'border-slate-200 hover:border-slate-300'
											]}
										>
											<input
												type="radio"
												name="tailSize"
												value={option.label}
												checked={form.tail.tailSize === option.label}
												onchange={() => {
													form.tail.tailSize = option.label;
													delete errors.tailSize;
												}}
												class="sr-only"
											/>
											<span class="block font-sniglet text-sm font-bold text-slate-800">
												{option.label}
											</span>
											<span class="mt-0.5 block font-sniglet text-xs text-lime-700">
												{option.note}
											</span>
										</label>
									{/each}
								</div>
								<p
									class="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 font-sniglet text-xs text-amber-700 italic"
								>
									*{TAIL_SIZE_NOTE}*
								</p>
								{#if errors.tailSize}
									<p class="mt-1 font-sniglet text-xs text-red-500">{errors.tailSize}</p>
								{/if}
							</div>
						</div>
					</section>
				{/if}

				<!-- Section D: Arm Sleeves (Shown when active, hidden for Mini Partial) -->
				{#if isArmSleevesActive}
					<section
						class="rounded-3xl border-4 border-primary-50 bg-white p-6 shadow-sm"
						aria-labelledby="armsleeves-section-title"
					>
						<div class="mb-4 flex items-center gap-2">
							<span class="text-2xl">💪</span>
							<h3 id="armsleeves-section-title" class="font-display text-2xl text-lime-600">
								Arm Sleeves Details
							</h3>
						</div>

						<div>
							<h4 class="mb-2 font-sniglet text-sm font-bold text-slate-800">
								Arm Measurements (required)
							</h4>
							<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
								<div data-error={!!errors.armLength}>
									<label
										for="input-arm-length"
										class="mb-1 block font-sniglet text-xs font-bold text-slate-600"
									>
										Arm Length (cm) <span class="text-red-500">*</span>
									</label>
									<input
										id="input-arm-length"
										type="number"
										min="20"
										max="100"
										step="0.5"
										placeholder="e.g. 55"
										bind:value={form.armSleeves.armLength}
										oninput={() => delete errors.armLength}
										class="w-full rounded-xl border-2 border-slate-200 p-2.5 font-sniglet text-xs focus:border-lime-500 focus:ring-0"
									/>
									{#if errors.armLength}
										<p class="mt-1 font-sniglet text-xs text-red-500">{errors.armLength}</p>
									{/if}
								</div>

								<div data-error={!!errors.upperArmCircumference}>
									<label
										for="input-upper-arm"
										class="mb-1 block font-sniglet text-xs font-bold text-slate-600"
									>
										Upper Arm Circumference (cm) <span class="text-red-500">*</span>
									</label>
									<input
										id="input-upper-arm"
										type="number"
										min="15"
										max="70"
										step="0.5"
										placeholder="e.g. 30"
										bind:value={form.armSleeves.upperArmCircumference}
										oninput={() => delete errors.upperArmCircumference}
										class="w-full rounded-xl border-2 border-slate-200 p-2.5 font-sniglet text-xs focus:border-lime-500 focus:ring-0"
									/>
									{#if errors.upperArmCircumference}
										<p class="mt-1 font-sniglet text-xs text-red-500">
											{errors.upperArmCircumference}
										</p>
									{/if}
								</div>

								<div data-error={!!errors.wristWidth}>
									<label
										for="input-wrist-width"
										class="mb-1 block font-sniglet text-xs font-bold text-slate-600"
									>
										Wrist Width (cm) <span class="text-red-500">*</span>
									</label>
									<input
										id="input-wrist-width"
										type="number"
										min="10"
										max="40"
										step="0.5"
										placeholder="e.g. 17"
										bind:value={form.armSleeves.wristWidth}
										oninput={() => delete errors.wristWidth}
										class="w-full rounded-xl border-2 border-slate-200 p-2.5 font-sniglet text-xs focus:border-lime-500 focus:ring-0"
									/>
									{#if errors.wristWidth}
										<p class="mt-1 font-sniglet text-xs text-red-500">{errors.wristWidth}</p>
									{/if}
								</div>
							</div>
						</div>
					</section>
				{/if}

				<!-- STEP 4: Always Visible (Character, Markings, Contact & TOS) -->
				<section
					class="space-y-6 rounded-3xl border-4 border-primary-50 bg-white p-6 shadow-sm"
					aria-labelledby="step4-title"
				>
					<div class="flex items-center gap-3">
						<span
							class="flex h-8 w-8 items-center justify-center rounded-full bg-lime-500 font-sniglet text-sm font-bold text-white"
						>
							4
						</span>
						<h2 id="step4-title" class="font-display text-2xl text-lime-600">
							Character & Contact Information
						</h2>
					</div>

					<!-- 1. Character Name & Species -->
					<div data-error={!!errors.characterNameSpecies}>
						<label
							for="input-char-name"
							class="mb-1 block font-sniglet text-sm font-bold text-slate-700"
						>
							Character Name & Species <span class="text-red-500">*</span>
						</label>
						<input
							id="input-char-name"
							type="text"
							placeholder="e.g. Meowcha (Calico Cat)"
							bind:value={form.general.characterNameSpecies}
							oninput={() => delete errors.characterNameSpecies}
							class="w-full rounded-xl border-2 border-slate-200 p-3 font-sniglet text-sm focus:border-lime-500 focus:ring-0"
						/>
						{#if errors.characterNameSpecies}
							<p class="mt-1 font-sniglet text-xs text-red-500">{errors.characterNameSpecies}</p>
						{/if}
					</div>

					<!-- 2. Character Reference Sheet -->
					<div data-error={!!errors.refSheet}>
						<div class="mb-1 flex items-baseline justify-between">
							<span class="font-sniglet text-sm font-bold text-slate-700">
								Character Reference Sheet <span class="text-red-500">*</span>
							</span>
							<span class="font-sniglet text-xs text-slate-500"> (Front and back, unshaded) </span>
						</div>

						<div class="mb-2 flex gap-2">
							<button
								type="button"
								onclick={() => (form.general.refSheetType = 'url')}
								class={[
									'cursor-pointer rounded-lg border-2 px-3 py-1 font-sniglet text-xs font-bold transition-all',
									form.general.refSheetType === 'url'
										? 'border-lime-500 bg-lime-50 text-lime-800'
										: 'border-slate-200 text-slate-600'
								]}
							>
								🔗 Image URL / Drive Link
							</button>
							<button
								type="button"
								onclick={() => (form.general.refSheetType = 'upload')}
								class={[
									'cursor-pointer rounded-lg border-2 px-3 py-1 font-sniglet text-xs font-bold transition-all',
									form.general.refSheetType === 'upload'
										? 'border-lime-500 bg-lime-50 text-lime-800'
										: 'border-slate-200 text-slate-600'
								]}
							>
								📁 File Upload
							</button>
						</div>

						{#if form.general.refSheetType === 'url'}
							<input
								id="input-ref-url"
								type="url"
								placeholder="https://... (Imgur, Google Drive, Sta.sh, etc.)"
								bind:value={form.general.refSheetUrl}
								oninput={() => delete errors.refSheet}
								class="w-full rounded-xl border-2 border-slate-200 p-3 font-sniglet text-sm focus:border-lime-500 focus:ring-0"
							/>
						{:else}
							<div class="flex items-center gap-3">
								<input
									id="input-ref-upload"
									type="file"
									accept="image/*"
									onchange={handleFileUpload}
									class="block w-full cursor-pointer font-sniglet text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-lime-500 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-lime-600"
								/>
							</div>
							{#if form.general.refSheetFileName}
								<p class="mt-1 font-sniglet text-xs text-lime-700">
									Selected file: {form.general.refSheetFileName}
								</p>
							{/if}
						{/if}

						{#if errors.refSheet}
							<p class="mt-1 font-sniglet text-xs text-red-500">{errors.refSheet}</p>
						{/if}
					</div>

					<!-- 3. Fur Type -->
					<div data-error={!!errors.furType}>
						<div class="mb-1 flex items-baseline justify-between">
							<span class="font-sniglet text-sm font-bold text-slate-700">
								Fur Type <span class="text-red-500">*</span>
							</span>
							<span class="font-sniglet text-xs text-slate-400">
								(Does not change the estimate; priced manually)
							</span>
						</div>
						<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<!-- Local faux fur -->
							<label
								class={[
									'flex cursor-pointer items-center justify-between rounded-xl border-2 p-3 font-sniglet text-sm font-bold transition-all',
									form.general.furType === 'Local faux fur'
										? 'border-lime-500 bg-lime-50 text-lime-800 shadow-sm'
										: 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
								]}
							>
								<input
									type="radio"
									name="furType"
									value="Local faux fur"
									checked={form.general.furType === 'Local faux fur'}
									onchange={() => {
										form.general.furType = 'Local faux fur';
										delete errors.furType;
									}}
									class="sr-only"
								/>
								<div class="flex flex-col">
									<span>Local faux fur</span>
									<span class="text-xs font-normal text-slate-500">Standard domestic faux fur</span>
								</div>
								<span
									class={[
										'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-xs',
										form.general.furType === 'Local faux fur'
											? 'border-lime-600 bg-lime-500 text-white'
											: 'border-slate-300'
									]}
								>
									{#if form.general.furType === 'Local faux fur'}✓{/if}
								</span>
							</label>

							<!-- Imported furs -->
							<label
								class={[
									'flex items-center justify-between rounded-xl border-2 p-3 font-sniglet text-sm font-bold transition-all',
									form.commissionPackage === 'per_parts'
										? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-60'
										: form.general.furType === 'Imported furs'
											? 'cursor-pointer border-lime-500 bg-lime-50 text-lime-800 shadow-sm'
											: 'cursor-pointer border-slate-200 bg-white text-slate-600 hover:border-slate-300'
								]}
							>
								<input
									type="radio"
									name="furType"
									value="Imported furs"
									disabled={form.commissionPackage === 'per_parts'}
									checked={form.general.furType === 'Imported furs'}
									onchange={() => {
										if (form.commissionPackage !== 'per_parts') {
											form.general.furType = 'Imported furs';
											delete errors.furType;
										}
									}}
									class="sr-only"
								/>
								<div class="flex flex-col">
									<span>Imported furs</span>
									{#if form.commissionPackage === 'per_parts'}
										<span class="text-xs font-normal text-amber-600">
											Only available for Partial and Mini Partial
										</span>
									{:else}
										<span class="text-xs font-normal text-slate-500"
											>Premium luxury imported fur</span
										>
									{/if}
								</div>
								<span
									class={[
										'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-xs',
										form.general.furType === 'Imported furs'
											? 'border-lime-600 bg-lime-500 text-white'
											: 'border-slate-300'
									]}
								>
									{#if form.general.furType === 'Imported furs'}✓{/if}
								</span>
							</label>
						</div>
						{#if errors.furType}
							<p class="mt-1 font-sniglet text-xs text-red-500">{errors.furType}</p>
						{/if}
					</div>

					<!-- 4. Fur Color Count -->
					<div data-error={!!errors.furColorCount}>
						<div class="mb-1 flex items-baseline justify-between">
							<span class="font-sniglet text-sm font-bold text-slate-700">
								Fur Color Count <span class="text-red-500">*</span>
							</span>
							<span class="font-sniglet text-xs text-slate-400">
								(Does not change the estimate; priced manually)
							</span>
						</div>
						<div class="grid grid-cols-3 gap-3">
							{#each ['1–2', '3–4', '5+'] as FurColorCount[] as count}
								<label
									class={[
										'cursor-pointer rounded-xl border-2 p-3 text-center font-sniglet text-sm font-bold transition-all',
										form.general.furColorCount === count
											? 'border-lime-500 bg-lime-50 text-lime-800 shadow-sm'
											: 'border-slate-200 text-slate-600 hover:border-slate-300'
									]}
								>
									<input
										type="radio"
										name="furColorCount"
										value={count}
										checked={form.general.furColorCount === count}
										onchange={() => {
											form.general.furColorCount = count;
											delete errors.furColorCount;
										}}
										class="sr-only"
									/>
									{count} Colors
								</label>
							{/each}
						</div>
						{#if errors.furColorCount}
							<p class="mt-1 font-sniglet text-xs text-red-500">{errors.furColorCount}</p>
						{/if}
					</div>

					<!-- 5. Markings -->
					<div>
						<div class="mb-1 flex items-baseline justify-between">
							<span class="font-sniglet text-sm font-bold text-slate-700">
								Markings <span class="text-xs font-normal text-slate-400"
									>(optional, priced manually)</span
								>
							</span>
						</div>
						<div class="grid max-w-md grid-cols-2 gap-3">
							{#each ['Simple', 'Complex'] as Marking[] as marking}
								<label
									class={[
										'flex cursor-pointer items-center justify-between rounded-xl border-2 p-3 font-sniglet text-sm font-bold transition-all',
										form.general.markings === marking
											? 'border-lime-500 bg-lime-50 text-lime-800 shadow-sm'
											: 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
									]}
								>
									<input
										type="radio"
										name="markings"
										value={marking}
										checked={form.general.markings === marking}
										onchange={() => (form.general.markings = marking)}
										class="sr-only"
									/>
									<span>{marking}</span>
									<span
										class={[
											'flex h-4 w-4 items-center justify-center rounded-full border text-xs',
											form.general.markings === marking
												? 'border-lime-600 bg-lime-500 text-white'
												: 'border-slate-300'
										]}
									>
										{#if form.general.markings === marking}✓{/if}
									</span>
								</label>
							{/each}
						</div>
					</div>

					<!-- 6. Artistic Liberty -->
					<div data-error={!!errors.artisticLiberty}>
						<span class="mb-1 block font-sniglet text-sm font-bold text-slate-700">
							Artistic Liberty <span class="text-red-500">*</span>
						</span>
						<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
							{#each ['Follow ref strictly', 'Allow minor adjustments for fur availability'] as ArtisticLiberty[] as liberty}
								<label
									class={[
										'flex cursor-pointer items-center gap-2 rounded-xl border-2 p-3 font-sniglet text-xs font-bold transition-all',
										form.general.artisticLiberty === liberty
											? 'border-lime-500 bg-lime-50 text-lime-800 shadow-sm'
											: 'border-slate-200 text-slate-600 hover:border-slate-300'
									]}
								>
									<input
										type="radio"
										name="artisticLiberty"
										value={liberty}
										checked={form.general.artisticLiberty === liberty}
										onchange={() => {
											form.general.artisticLiberty = liberty;
											delete errors.artisticLiberty;
										}}
										class="sr-only"
									/>
									<span
										class={[
											'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-xs',
											form.general.artisticLiberty === liberty
												? 'border-lime-600 bg-lime-500 text-white'
												: 'border-slate-300'
										]}
									>
										{#if form.general.artisticLiberty === liberty}✓{/if}
									</span>
									{liberty}
								</label>
							{/each}
						</div>
						{#if errors.artisticLiberty}
							<p class="mt-1 font-sniglet text-xs text-red-500">{errors.artisticLiberty}</p>
						{/if}
					</div>

					<!-- 7. Contact Details -->
					<div class="space-y-4 border-t border-slate-100 pt-4">
						<h3 class="font-display text-xl text-slate-800">Contact & Shipping Details</h3>

						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<!-- Name / Handle -->
							<div data-error={!!errors.contactName}>
								<label
									for="input-contact-name"
									class="mb-1 block font-sniglet text-sm font-bold text-slate-700"
								>
									Name / Handle <span class="text-red-500">*</span>
								</label>
								<input
									id="input-contact-name"
									type="text"
									placeholder="Your name or preferred nickname"
									bind:value={form.general.contactName}
									oninput={() => delete errors.contactName}
									class="w-full rounded-xl border-2 border-slate-200 p-2.5 font-sniglet text-sm focus:border-lime-500 focus:ring-0"
								/>
								{#if errors.contactName}
									<p class="mt-1 font-sniglet text-xs text-red-500">{errors.contactName}</p>
								{/if}
							</div>

							<!-- Primary Contact -->
							<div data-error={!!errors.contactValue}>
								<div class="mb-1 flex items-center justify-between">
									<label
										for="input-contact-val"
										class="font-sniglet text-sm font-bold text-slate-700"
									>
										Primary Contact <span class="text-red-500">*</span>
									</label>
									<select
										aria-label="Contact Method"
										bind:value={form.general.contactMethod}
										class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 font-sniglet text-xs"
									>
										<option value="Discord">Discord</option>
										<option value="Telegram">Telegram</option>
										<option value="Email">Email</option>
									</select>
								</div>
								<input
									id="input-contact-val"
									type="text"
									placeholder={`Your ${form.general.contactMethod} handle or address`}
									bind:value={form.general.contactValue}
									oninput={() => delete errors.contactValue}
									class="w-full rounded-xl border-2 border-slate-200 p-2.5 font-sniglet text-sm focus:border-lime-500 focus:ring-0"
								/>
								{#if errors.contactValue}
									<p class="mt-1 font-sniglet text-xs text-red-500">{errors.contactValue}</p>
								{/if}
							</div>

							<!-- Country / Shipping Destination -->
							<div class="sm:col-span-2" data-error={!!errors.shippingDestination}>
								<label
									for="input-shipping-dest"
									class="mb-1 block font-sniglet text-sm font-bold text-slate-700"
								>
									Country / Shipping Destination <span class="text-red-500">*</span>
								</label>
								<input
									id="input-shipping-dest"
									type="text"
									placeholder="e.g. Indonesia, United States, Germany..."
									bind:value={form.general.shippingDestination}
									oninput={() => delete errors.shippingDestination}
									class="w-full rounded-xl border-2 border-slate-200 p-2.5 font-sniglet text-sm focus:border-lime-500 focus:ring-0"
								/>
								{#if errors.shippingDestination}
									<p class="mt-1 font-sniglet text-xs text-red-500">{errors.shippingDestination}</p>
								{/if}
							</div>
						</div>
					</div>

					<!-- 8. Required Checkbox: Age & TOS -->
					<div class="border-t border-slate-100 pt-4" data-error={!!errors.agreeToTerms}>
						<label class="flex cursor-pointer items-start gap-3">
							<input
								type="checkbox"
								bind:checked={form.general.agreeToTerms}
								onchange={() => delete errors.agreeToTerms}
								class="mt-1 h-5 w-5 cursor-pointer rounded border-2 border-slate-300 text-lime-600 focus:ring-lime-500"
							/>
							<span class="font-sniglet text-sm text-slate-700 select-none">
								I am 18+ and agree to the{' '}
								<a
									href={resolve('/tos/fursuit')}
									target="_blank"
									class="font-bold text-lime-600 underline hover:text-lime-700"
								>
									Terms of Service
								</a>.
								<span class="text-red-500">*</span>
							</span>
						</label>
						{#if errors.agreeToTerms}
							<p class="mt-1 font-sniglet text-xs text-red-500">{errors.agreeToTerms}</p>
						{/if}
					</div>

					<!-- Submit Button (Mobile / Bottom of Form) -->
					<div class="pt-4">
						<button
							type="submit"
							class="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-3 border-custom-black bg-lime-500 px-6 py-4 font-display text-2xl tracking-wide text-white shadow-md transition-all hover:bg-lime-600 active:scale-[0.99]"
						>
							<span>Generate Quote Request</span>
							<span>✨</span>
						</button>
					</div>
				</section>
			</form>

			<!-- RIGHT COLUMN: Sticky Live Estimate Price Card (Cols 9-12) -->
			<aside class="sticky top-28 space-y-6 lg:col-span-4">
				<div class="rounded-3xl border-4 border-primary-50 bg-white p-6 text-slate-800 shadow-md">
					<span class="block font-sniglet text-xs font-bold tracking-wider text-lime-700 uppercase">
						Live Calculation
					</span>
					<h3 class="mt-0.5 mb-3 font-display text-2xl text-slate-800">Estimated Base Price</h3>

					<!-- Total Price Display (IDR standard format) -->
					<div class="mb-4 rounded-2xl border-2 border-lime-300 bg-lime-50 p-4 text-center">
						<span class="block font-display text-3xl text-lime-600 sm:text-4xl">
							{priceBreakdown.formattedTotal}
						</span>
						<span class="mt-1 block font-sniglet text-xs text-slate-500">
							Currency: IDR (Indonesian Rupiah)
						</span>
					</div>

					<!-- Mandatory Notice -->
					<div class="mb-5 rounded-xl border border-amber-200 bg-amber-50/80 p-3">
						<p class="font-sniglet text-xs leading-relaxed text-amber-900 italic">
							*{PRICE_ESTIMATE_NOTICE}*
						</p>
					</div>

					<!-- Breakdown List -->
					<div class="space-y-2.5 border-t border-slate-100 pt-4 font-sniglet text-xs">
						<div class="text-[11px] font-bold tracking-wide text-slate-700 uppercase">
							Selected Package & Parts:
						</div>

						{#if form.commissionPackage === 'partial'}
							<div class="flex justify-between text-slate-700">
								<span>Partial Bundle</span>
								<span class="font-bold">{formatIDR(BASE_PRICES.partial)}</span>
							</div>
							<div class="pl-2 text-[11px] text-slate-500">• Head, Paws, Tail, Arm Sleeves</div>
						{:else if form.commissionPackage === 'mini_partial'}
							<div class="flex justify-between text-slate-700">
								<span>Mini Partial Bundle</span>
								<span class="font-bold">{formatIDR(BASE_PRICES.mini_partial)}</span>
							</div>
							<div class="pl-2 text-[11px] text-slate-500">• Head, Paws, Tail</div>
						{:else}
							<!-- Per Parts breakdown -->
							{#if priceBreakdown.partsBreakdown.length === 0}
								<p class="text-slate-400 italic">No parts selected yet.</p>
							{:else}
								{#each priceBreakdown.partsBreakdown as item}
									<div class="flex justify-between text-slate-700">
										<span>{item.name}</span>
										<span class="font-bold">{formatIDR(item.price)}</span>
									</div>
								{/each}
							{/if}
						{/if}

						<!-- Tail Size Adjustment (if Tail is included) -->
						{#if isTailActive}
							<div
								class="flex items-center justify-between border-t border-dashed border-slate-200 pt-2"
							>
								<div>
									<span class="block text-slate-700">Tail Adjustment:</span>
									<span class="text-[11px] text-slate-500">{form.tail.tailSize || 'Standard'}</span>
								</div>
								<span
									class={[
										'font-bold',
										priceBreakdown.tailAdjustment < 0
											? 'text-emerald-600'
											: priceBreakdown.tailAdjustment > 0
												? 'text-amber-600'
												: 'text-slate-500'
									]}
								>
									{priceBreakdown.tailAdjustment > 0 ? '+' : ''}{formatIDR(
										priceBreakdown.tailAdjustment
									)}
								</span>
							</div>
						{/if}

						<div
							class="flex justify-between border-t-2 border-slate-200 pt-3 text-sm font-bold text-slate-800"
						>
							<span>Total Estimated:</span>
							<span class="text-lime-700">{priceBreakdown.formattedTotal}</span>
						</div>
					</div>
				</div>

				<!-- Quick Help / Information Card -->
				<div class="rounded-3xl border-4 border-primary-50 bg-white p-5 text-slate-700 shadow-sm">
					<h4 class="mb-2 font-display text-lg text-slate-800">Need Guidance?</h4>
					<p class="mb-3 font-sniglet text-xs leading-relaxed text-slate-600">
						Have questions before ordering? Review our Terms of Service or get in touch.
					</p>
					<a
						href={resolve('/tos/fursuit')}
						class="inline-flex items-center gap-1 font-sniglet text-xs font-bold text-amber-600 underline hover:text-amber-700"
					>
						<span>Read Fursuit Terms & Safety Guidelines</span>
						<span>→</span>
					</a>
				</div>
			</aside>
		</div>
	{/if}
</section>
