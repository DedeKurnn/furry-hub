import type {
	CommissionFormState,
	CommissionPackage,
	CommissionSubmissionPayload,
	GeneralData,
	HeadData,
	PawsData,
	PriceBreakdown,
	TailData,
	ArmSleevesData,
	PartType
} from '$lib/types/commission';

export const BASE_PRICES = {
	partial: 3400000,
	mini_partial: 3000000,
	per_parts: {
		head: 2000000,
		paws: 600000,
		tail: 600000,
		arm_sleeves: 400000
	}
} as const;

export const TAIL_BASE_PRICE = 600000;
export const TAIL_ADJUSTMENT_PERCENT = 0.2; // 20%
export const TAIL_ADJUSTMENT_AMOUNT = TAIL_BASE_PRICE * TAIL_ADJUSTMENT_PERCENT; // 120,000

export const PRICE_ESTIMATE_NOTICE =
	'Estimate only. The actual price will be determined after your selections and reference sheet are reviewed.';

export const TAIL_SIZE_NOTE =
	'Tail size adjusts the estimated price (Nub −20%, Floor-Dragger +20% on the tail price).';

/**
 * Formats a number in IDR according to Indonesian standard (Rp 3.400.000)
 */
export function formatIDR(amount: number): string {
	const formatted = new Intl.NumberFormat('id-ID', {
		maximumFractionDigits: 0
	}).format(Math.round(amount));
	return `Rp ${formatted}`;
}

export const INITIAL_HEAD_DATA: HeadData = {
	headAddons: '',
	headCircumference: '',
	headHeight: ''
};

export const INITIAL_PAWS_DATA: PawsData = {
	fingerCount: ''
};

export const INITIAL_TAIL_DATA: TailData = {
	tailSize: 'Standard'
};

export const INITIAL_ARM_SLEEVES_DATA: ArmSleevesData = {
	armLength: '',
	upperArmCircumference: '',
	wristWidth: ''
};

export const INITIAL_GENERAL_DATA: GeneralData = {
	characterNameSpecies: '',
	refSheetType: 'url',
	refSheetUrl: '',
	refSheetFileName: '',
	furType: 'Local faux fur',
	furColorCount: '',
	markings: '',
	artisticLiberty: '',
	contactName: '',
	contactMethod: 'Discord',
	contactValue: '',
	shippingDestination: '',
	agreeToTerms: false
};

export const INITIAL_FORM_STATE: CommissionFormState = {
	commissionPackage: 'partial',
	selectedParts: ['head', 'paws', 'tail', 'arm_sleeves'],
	head: { ...INITIAL_HEAD_DATA },
	paws: { ...INITIAL_PAWS_DATA },
	tail: { ...INITIAL_TAIL_DATA },
	armSleeves: { ...INITIAL_ARM_SLEEVES_DATA },
	general: { ...INITIAL_GENERAL_DATA }
};

/**
 * Returns which parts are currently active based on the package and selection
 */
export function getActiveParts(pkg: CommissionPackage, selectedParts: PartType[]): PartType[] {
	if (pkg === 'partial') {
		return ['head', 'paws', 'tail', 'arm_sleeves'];
	}
	if (pkg === 'mini_partial') {
		return ['head', 'paws', 'tail'];
	}
	// per_parts
	return selectedParts;
}

/**
 * Detects if a set of selected parts matches a predefined bundle combination:
 * - head, paws, tail, arm_sleeves -> 'partial'
 * - head, paws, tail (without arm_sleeves) -> 'mini_partial'
 */
export function detectBundleFromParts(parts: PartType[]): 'partial' | 'mini_partial' | null {
	const hasHead = parts.includes('head');
	const hasPaws = parts.includes('paws');
	const hasTail = parts.includes('tail');
	const hasArmSleeves = parts.includes('arm_sleeves');

	if (hasHead && hasPaws && hasTail && hasArmSleeves) {
		return 'partial';
	}
	if (hasHead && hasPaws && hasTail && !hasArmSleeves && parts.length === 3) {
		return 'mini_partial';
	}
	return null;
}

/**
 * Determines whether a specific part section is visible
 */
export function isPartVisible(
	part: PartType,
	pkg: CommissionPackage,
	selectedParts: PartType[]
): boolean {
	const active = getActiveParts(pkg, selectedParts);
	return active.includes(part);
}

/**
 * Calculates the tail adjustment in IDR
 */
export function getTailAdjustment(tailSize: string, isTailActive: boolean): number {
	if (!isTailActive) return 0;
	if (tailSize === 'Nub / Small') {
		return -TAIL_ADJUSTMENT_AMOUNT; // -120,000
	}
	if (tailSize === 'Floor-Dragger') {
		return TAIL_ADJUSTMENT_AMOUNT; // +120,000
	}
	return 0; // Standard or not set
}

/**
 * Calculates the total estimated base price and returns a detailed breakdown
 */
export function calculatePriceBreakdown(
	pkg: CommissionPackage,
	selectedParts: PartType[],
	tailSize: string
): PriceBreakdown {
	const activeParts = getActiveParts(pkg, selectedParts);
	const hasTail = activeParts.includes('tail');
	const tailAdj = getTailAdjustment(tailSize, hasTail);

	if (pkg === 'partial') {
		const base = BASE_PRICES.partial;
		const total = Math.max(0, base + tailAdj);
		return {
			packageType: pkg,
			baseName: 'Partial Bundle (Head, Paws, Tail, Arm Sleeves)',
			basePrice: base,
			partsBreakdown: [{ name: 'Partial Bundle Base', price: base }],
			tailAdjustment: tailAdj,
			totalEstimatedBasePrice: total,
			formattedTotal: formatIDR(total)
		};
	}

	if (pkg === 'mini_partial') {
		const base = BASE_PRICES.mini_partial;
		const total = Math.max(0, base + tailAdj);
		return {
			packageType: pkg,
			baseName: 'Mini Partial Bundle (Head, Paws, Tail)',
			basePrice: base,
			partsBreakdown: [{ name: 'Mini Partial Bundle Base', price: base }],
			tailAdjustment: tailAdj,
			totalEstimatedBasePrice: total,
			formattedTotal: formatIDR(total)
		};
	}

	// Per Parts
	const breakdown: { name: string; price: number }[] = [];
	let subtotal = 0;

	if (activeParts.includes('head')) {
		breakdown.push({ name: 'Head', price: BASE_PRICES.per_parts.head });
		subtotal += BASE_PRICES.per_parts.head;
	}
	if (activeParts.includes('paws')) {
		breakdown.push({ name: 'Paws', price: BASE_PRICES.per_parts.paws });
		subtotal += BASE_PRICES.per_parts.paws;
	}
	if (activeParts.includes('tail')) {
		breakdown.push({ name: 'Tail Base', price: BASE_PRICES.per_parts.tail });
		subtotal += BASE_PRICES.per_parts.tail;
	}
	if (activeParts.includes('arm_sleeves')) {
		breakdown.push({ name: 'Arm Sleeves', price: BASE_PRICES.per_parts.arm_sleeves });
		subtotal += BASE_PRICES.per_parts.arm_sleeves;
	}

	const total = Math.max(0, subtotal + tailAdj);

	return {
		packageType: pkg,
		baseName: 'Per Parts Selection',
		basePrice: subtotal,
		partsBreakdown: breakdown,
		tailAdjustment: tailAdj,
		totalEstimatedBasePrice: total,
		formattedTotal: formatIDR(total)
	};
}

/**
 * Cleans the state by zeroing/resetting hidden section values and auto-converting
 * per-parts bundle combinations to their respective packages.
 */
export function sanitizeFormState(state: CommissionFormState): CommissionFormState {
	let pkg = state.commissionPackage;
	let parts = [...state.selectedParts];

	// Auto-convert bundle combinations if on per_parts
	if (pkg === 'per_parts') {
		const detected = detectBundleFromParts(parts);
		if (detected === 'partial') {
			pkg = 'partial';
			parts = ['head', 'paws', 'tail', 'arm_sleeves'];
		} else if (detected === 'mini_partial') {
			pkg = 'mini_partial';
			parts = ['head', 'paws', 'tail'];
		}
	}

	const active = getActiveParts(pkg, parts);
	const sanitizedFurType =
		pkg === 'per_parts' && state.general.furType === 'Imported furs'
			? 'Local faux fur'
			: state.general.furType;

	return {
		...state,
		commissionPackage: pkg,
		selectedParts: parts,
		head: active.includes('head') ? { ...state.head } : { ...INITIAL_HEAD_DATA },
		paws: active.includes('paws') ? { ...state.paws } : { ...INITIAL_PAWS_DATA },
		tail: active.includes('tail') ? { ...state.tail } : { ...INITIAL_TAIL_DATA },
		armSleeves: active.includes('arm_sleeves')
			? { ...state.armSleeves }
			: { ...INITIAL_ARM_SLEEVES_DATA },
		general: {
			...state.general,
			furType: sanitizedFurType
		}
	};
}

/**
 * Builds the submitted payload. Hidden sections must not appear in the payload.
 */
export function buildSubmissionPayload(state: CommissionFormState): CommissionSubmissionPayload {
	const sanitized = sanitizeFormState(state);
	const active = getActiveParts(sanitized.commissionPackage, sanitized.selectedParts);
	const breakdown = calculatePriceBreakdown(
		sanitized.commissionPackage,
		sanitized.selectedParts,
		sanitized.tail.tailSize
	);

	const payload: CommissionSubmissionPayload = {
		commissionPackage: sanitized.commissionPackage,
		estimatedBasePrice: breakdown.totalEstimatedBasePrice,
		formattedPrice: breakdown.formattedTotal,
		activeParts: active,
		general: { ...sanitized.general },
		submittedAt: new Date().toISOString()
	};

	if (active.includes('head')) {
		payload.head = { ...sanitized.head };
	}
	if (active.includes('paws')) {
		payload.paws = { ...sanitized.paws };
	}
	if (active.includes('tail')) {
		payload.tail = { ...sanitized.tail };
	}
	if (active.includes('arm_sleeves')) {
		payload.armSleeves = { ...sanitized.armSleeves };
	}

	return payload;
}

export interface ValidationResult {
	isValid: boolean;
	errors: Record<string, string>;
}

/**
 * Validates the form state against the rules specified in AGENTS.md
 */
export function validateCommissionForm(state: CommissionFormState): ValidationResult {
	const errors: Record<string, string> = {};
	const active = getActiveParts(state.commissionPackage, state.selectedParts);

	// Per Parts: must have at least one part checked
	if (state.commissionPackage === 'per_parts') {
		if (active.length === 0) {
			errors.selectedParts = 'Please select at least one part for Per Parts commission.';
		} else {
			const detectedBundle = detectBundleFromParts(state.selectedParts);
			if (detectedBundle === 'partial') {
				errors.selectedParts =
					'Selecting Head, Paws, Tail, and Arm Sleeves automatically qualifies as a Partial bundle. Please select the Partial package.';
			} else if (detectedBundle === 'mini_partial') {
				errors.selectedParts =
					'Selecting Head, Paws, and Tail automatically qualifies as a Mini Partial bundle. Please select the Mini Partial package.';
			}
		}
	}

	// Head validation
	if (active.includes('head')) {
		if (state.head.headCircumference === '' || Number(state.head.headCircumference) <= 0) {
			errors.headCircumference = 'Head circumference (cm) is required and must be greater than 0.';
		}
		if (state.head.headHeight === '' || Number(state.head.headHeight) <= 0) {
			errors.headHeight = 'Head height (cm) is required and must be greater than 0.';
		}
	}

	// Paws validation
	if (active.includes('paws')) {
		if (!state.paws.fingerCount) {
			errors.fingerCount = 'Please select a finger count.';
		}
	}

	// Tail validation
	if (active.includes('tail')) {
		if (!state.tail.tailSize) {
			errors.tailSize = 'Please choose a tail size.';
		}
	}

	// Arm Sleeves validation
	if (active.includes('arm_sleeves')) {
		if (state.armSleeves.armLength === '' || Number(state.armSleeves.armLength) <= 0) {
			errors.armLength = 'Arm length (cm) is required and must be greater than 0.';
		}
		if (
			state.armSleeves.upperArmCircumference === '' ||
			Number(state.armSleeves.upperArmCircumference) <= 0
		) {
			errors.upperArmCircumference =
				'Upper arm circumference (cm) is required and must be greater than 0.';
		}
		if (state.armSleeves.wristWidth === '' || Number(state.armSleeves.wristWidth) <= 0) {
			errors.wristWidth = 'Wrist width (cm) is required and must be greater than 0.';
		}
	}

	// General validation (Step 4 - Always visible)
	if (!state.general.characterNameSpecies.trim()) {
		errors.characterNameSpecies = 'Character name and species are required.';
	}

	if (state.general.refSheetType === 'url' && !state.general.refSheetUrl.trim()) {
		errors.refSheet = 'Please provide a character reference sheet URL.';
	} else if (
		state.general.refSheetType === 'upload' &&
		!state.general.refSheetFileName &&
		!state.general.refSheetUrl
	) {
		errors.refSheet = 'Please upload a reference sheet image file.';
	}

	if (!state.general.furType) {
		errors.furType = 'Please select a fur type.';
	} else if (state.commissionPackage === 'per_parts' && state.general.furType === 'Imported furs') {
		errors.furType = 'Imported furs are only available for Mini Partial and Partial packages.';
	}

	if (!state.general.furColorCount) {
		errors.furColorCount = 'Please specify the fur color count.';
	}

	if (!state.general.artisticLiberty) {
		errors.artisticLiberty = 'Please select an artistic liberty preference.';
	}

	if (!state.general.contactName.trim()) {
		errors.contactName = 'Your name or handle is required.';
	}

	if (!state.general.contactValue.trim()) {
		errors.contactValue = `Primary contact details (${state.general.contactMethod}) are required.`;
	}

	if (!state.general.shippingDestination.trim()) {
		errors.shippingDestination = 'Country / shipping destination is required.';
	}

	if (!state.general.agreeToTerms) {
		errors.agreeToTerms = 'You must confirm you are 18+ and agree to the Terms of Service.';
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors
	};
}
