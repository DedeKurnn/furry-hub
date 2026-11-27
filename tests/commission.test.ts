// @ts-nocheck
import { describe, expect, it } from 'bun:test';
import {
	BASE_PRICES,
	buildSubmissionPayload,
	calculatePriceBreakdown,
	formatIDR,
	getActiveParts,
	detectBundleFromParts,
	INITIAL_ARM_SLEEVES_DATA,
	INITIAL_FORM_STATE,
	INITIAL_HEAD_DATA,
	isPartVisible,
	sanitizeFormState,
	validateCommissionForm
} from '../src/lib/utils/commission';
import type { CommissionFormState } from '../src/lib/types/commission';

describe('Pricing calculations', () => {
	it('formats numbers into IDR standard', () => {
		expect(formatIDR(3400000)).toBe('Rp 3.400.000');
		expect(formatIDR(3000000)).toBe('Rp 3.000.000');
		expect(formatIDR(600000)).toBe('Rp 600.000');
		expect(formatIDR(120000)).toBe('Rp 120.000');
	});

	it('calculates Partial bundle price correctly with tail size adjustments', () => {
		// Standard tail
		const std = calculatePriceBreakdown(
			'partial',
			['head', 'paws', 'tail', 'arm_sleeves'],
			'Standard'
		);
		expect(std.basePrice).toBe(3400000);
		expect(std.tailAdjustment).toBe(0);
		expect(std.totalEstimatedBasePrice).toBe(3400000);
		expect(std.formattedTotal).toBe('Rp 3.400.000');

		// Nub / Small tail (-20% of 600,000 = -120,000)
		const nub = calculatePriceBreakdown(
			'partial',
			['head', 'paws', 'tail', 'arm_sleeves'],
			'Nub / Small'
		);
		expect(nub.tailAdjustment).toBe(-120000);
		expect(nub.totalEstimatedBasePrice).toBe(3280000);
		expect(nub.formattedTotal).toBe('Rp 3.280.000');

		// Floor-Dragger tail (+20% of 600,000 = +120,000)
		const floor = calculatePriceBreakdown(
			'partial',
			['head', 'paws', 'tail', 'arm_sleeves'],
			'Floor-Dragger'
		);
		expect(floor.tailAdjustment).toBe(120000);
		expect(floor.totalEstimatedBasePrice).toBe(3520000);
		expect(floor.formattedTotal).toBe('Rp 3.520.000');
	});

	it('calculates Mini Partial bundle price correctly with tail size adjustments', () => {
		const std = calculatePriceBreakdown('mini_partial', ['head', 'paws', 'tail'], 'Standard');
		expect(std.basePrice).toBe(3000000);
		expect(std.tailAdjustment).toBe(0);
		expect(std.totalEstimatedBasePrice).toBe(3000000);

		const nub = calculatePriceBreakdown('mini_partial', ['head', 'paws', 'tail'], 'Nub / Small');
		expect(nub.totalEstimatedBasePrice).toBe(2880000);

		const floor = calculatePriceBreakdown(
			'mini_partial',
			['head', 'paws', 'tail'],
			'Floor-Dragger'
		);
		expect(floor.totalEstimatedBasePrice).toBe(3120000);
	});

	it('calculates Per Parts price correctly', () => {
		// Head only: 2,000,000
		const headOnly = calculatePriceBreakdown('per_parts', ['head'], 'Standard');
		expect(headOnly.totalEstimatedBasePrice).toBe(2000000);
		expect(headOnly.tailAdjustment).toBe(0);

		// Head + Paws: 2,000,000 + 600,000 = 2,600,000
		const headPaws = calculatePriceBreakdown('per_parts', ['head', 'paws'], 'Standard');
		expect(headPaws.totalEstimatedBasePrice).toBe(2600000);

		// Tail only with Floor-Dragger: 600,000 + 120,000 = 720,000
		const tailFloor = calculatePriceBreakdown('per_parts', ['tail'], 'Floor-Dragger');
		expect(tailFloor.totalEstimatedBasePrice).toBe(720000);

		// Tail only with Nub / Small: 600,000 - 120,000 = 480,000
		const tailNub = calculatePriceBreakdown('per_parts', ['tail'], 'Nub / Small');
		expect(tailNub.totalEstimatedBasePrice).toBe(480000);

		// Per parts with no tail: tail adjustment is NOT applied even if tailSize is set
		const noTail = calculatePriceBreakdown('per_parts', ['head', 'arm_sleeves'], 'Floor-Dragger');
		expect(noTail.tailAdjustment).toBe(0);
		expect(noTail.totalEstimatedBasePrice).toBe(2400000); // 2,000,000 + 400,000

		// Empty selection: 0
		const empty = calculatePriceBreakdown('per_parts', [], 'Standard');
		expect(empty.totalEstimatedBasePrice).toBe(0);
	});
});

describe('Visibility and active parts logic', () => {
	it('determines active parts by package', () => {
		expect(getActiveParts('partial', [])).toEqual(['head', 'paws', 'tail', 'arm_sleeves']);
		expect(getActiveParts('mini_partial', [])).toEqual(['head', 'paws', 'tail']);
		expect(getActiveParts('per_parts', ['head', 'tail'])).toEqual(['head', 'tail']);
	});

	it('evaluates part visibility correctly', () => {
		expect(isPartVisible('arm_sleeves', 'partial', [])).toBe(true);
		expect(isPartVisible('arm_sleeves', 'mini_partial', [])).toBe(false);
		expect(isPartVisible('arm_sleeves', 'per_parts', ['head', 'tail'])).toBe(false);
		expect(isPartVisible('arm_sleeves', 'per_parts', ['arm_sleeves'])).toBe(true);
	});

	it('detects predefined bundle combinations from parts list', () => {
		// All 4 parts -> 'partial'
		expect(detectBundleFromParts(['head', 'paws', 'tail', 'arm_sleeves'])).toBe('partial');
		expect(detectBundleFromParts(['arm_sleeves', 'tail', 'paws', 'head'])).toBe('partial');

		// 3 parts (head, paws, tail) -> 'mini_partial'
		expect(detectBundleFromParts(['head', 'paws', 'tail'])).toBe('mini_partial');
		expect(detectBundleFromParts(['tail', 'paws', 'head'])).toBe('mini_partial');

		// Other combinations -> null
		expect(detectBundleFromParts(['head', 'paws'])).toBeNull();
		expect(detectBundleFromParts(['head', 'tail'])).toBeNull();
		expect(detectBundleFromParts(['head', 'arm_sleeves'])).toBeNull();
		expect(detectBundleFromParts(['head', 'paws', 'arm_sleeves'])).toBeNull();
		expect(detectBundleFromParts(['paws', 'tail', 'arm_sleeves'])).toBeNull();
		expect(detectBundleFromParts([])).toBeNull();
	});
});

describe('State cleanup and sanitization', () => {
	it('clears hidden part values when sanitized', () => {
		const state: CommissionFormState = {
			...INITIAL_FORM_STATE,
			commissionPackage: 'mini_partial',
			armSleeves: {
				armLength: 50,
				upperArmCircumference: 28,
				wristWidth: 16
			}
		};

		const sanitized = sanitizeFormState(state);
		// Arm sleeves is hidden in Mini Partial -> must be reset to initial empty
		expect(sanitized.armSleeves).toEqual(INITIAL_ARM_SLEEVES_DATA);
	});

	it('resets Imported furs to Local faux fur if package is per_parts', () => {
		const state: CommissionFormState = {
			...INITIAL_FORM_STATE,
			commissionPackage: 'per_parts',
			selectedParts: ['head'],
			general: {
				...INITIAL_FORM_STATE.general,
				characterNameSpecies: 'Sparky (Wolf)',
				furType: 'Imported furs'
			}
		};
		const sanitized = sanitizeFormState(state);
		expect(sanitized.general.furType).toBe('Local faux fur');

		const payload = buildSubmissionPayload(state);
		expect(payload.general.furType).toBe('Local faux fur');
	});

	it('auto-converts per_parts to partial when all 4 parts are selected', () => {
		const state: CommissionFormState = {
			...INITIAL_FORM_STATE,
			commissionPackage: 'per_parts',
			selectedParts: ['head', 'paws', 'tail', 'arm_sleeves']
		};
		const sanitized = sanitizeFormState(state);
		expect(sanitized.commissionPackage).toBe('partial');
		expect(sanitized.selectedParts).toEqual(['head', 'paws', 'tail', 'arm_sleeves']);

		const payload = buildSubmissionPayload(state);
		expect(payload.commissionPackage).toBe('partial');
	});

	it('auto-converts per_parts to mini_partial when head, paws, tail are selected', () => {
		const state: CommissionFormState = {
			...INITIAL_FORM_STATE,
			commissionPackage: 'per_parts',
			selectedParts: ['head', 'paws', 'tail']
		};
		const sanitized = sanitizeFormState(state);
		expect(sanitized.commissionPackage).toBe('mini_partial');
		expect(sanitized.selectedParts).toEqual(['head', 'paws', 'tail']);

		const payload = buildSubmissionPayload(state);
		expect(payload.commissionPackage).toBe('mini_partial');
	});

	it('omits inactive parts from submission payload', () => {
		const state: CommissionFormState = {
			...INITIAL_FORM_STATE,
			commissionPackage: 'per_parts',
			selectedParts: ['head'],
			head: {
				headAddons: 'None',
				headCircumference: 56,
				headHeight: 25
			},
			// Inactive parts have dummy values
			paws: { fingerCount: '5-Finger' },
			armSleeves: {
				armLength: 50,
				upperArmCircumference: 28,
				wristWidth: 16
			}
		};

		const payload = buildSubmissionPayload(state);
		expect(payload.head).toBeDefined();
		expect(payload.paws).toBeUndefined();
		expect(payload.tail).toBeUndefined();
		expect(payload.armSleeves).toBeUndefined();
		expect(payload.activeParts).toEqual(['head']);
		expect(payload.estimatedBasePrice).toBe(2000000);
	});
});

describe('Validation rules', () => {
	const validGeneral = {
		characterNameSpecies: 'Sparky (Wolf)',
		refSheetType: 'url' as const,
		refSheetUrl: 'https://example.com/ref.png',
		refSheetFileName: '',
		furType: 'Local faux fur' as const,
		furColorCount: '1–2' as const,
		markings: 'Simple' as const,
		artisticLiberty: 'Follow ref strictly' as const,
		contactName: 'SparkyWolf',
		contactMethod: 'Discord' as const,
		contactValue: 'sparky#1234',
		shippingDestination: 'Indonesia',
		agreeToTerms: true
	};

	it('fails if Per Parts has zero checked parts', () => {
		const state: CommissionFormState = {
			...INITIAL_FORM_STATE,
			commissionPackage: 'per_parts',
			selectedParts: [],
			general: { ...validGeneral }
		};

		const result = validateCommissionForm(state);
		expect(result.isValid).toBe(false);
		expect(result.errors.selectedParts).toBeDefined();
	});

	it('fails if measurement fields are empty or invalid', () => {
		const state: CommissionFormState = {
			...INITIAL_FORM_STATE,
			commissionPackage: 'partial',
			head: {
				...INITIAL_HEAD_DATA,
				headCircumference: '', // missing!
				headHeight: 25
			},
			general: { ...validGeneral }
		};

		const result = validateCommissionForm(state);
		expect(result.isValid).toBe(false);
		expect(result.errors.headCircumference).toBeDefined();
	});

	it('fails if contact or ToS are incomplete', () => {
		const state: CommissionFormState = {
			...INITIAL_FORM_STATE,
			commissionPackage: 'mini_partial',
			head: {
				headCircumference: 56,
				headHeight: 25
			},
			paws: { fingerCount: '4-Finger' },
			tail: { tailSize: 'Standard' },
			general: {
				...validGeneral,
				contactValue: '', // missing
				agreeToTerms: false // not agreed
			}
		};

		const result = validateCommissionForm(state);
		expect(result.isValid).toBe(false);
		expect(result.errors.contactValue).toBeDefined();
		expect(result.errors.agreeToTerms).toBeDefined();
	});

	it('passes when all active fields are valid', () => {
		const state: CommissionFormState = {
			...INITIAL_FORM_STATE,
			commissionPackage: 'partial',
			head: {
				headCircumference: 56,
				headHeight: 25
			},
			paws: { fingerCount: '5-Finger' },
			tail: { tailSize: 'Standard' },
			armSleeves: {
				armLength: 55,
				upperArmCircumference: 30,
				wristWidth: 17
			},
			general: { ...validGeneral }
		};

		const result = validateCommissionForm(state);
		expect(result.isValid).toBe(true);
		expect(Object.keys(result.errors).length).toBe(0);
	});

	it('validates furType correctly and rejects Imported furs for Per Parts', () => {
		const missingFurState: CommissionFormState = {
			...INITIAL_FORM_STATE,
			commissionPackage: 'partial',
			head: { headCircumference: 56, headHeight: 25 },
			paws: { fingerCount: '5-Finger' },
			tail: { tailSize: 'Standard' },
			armSleeves: { armLength: 55, upperArmCircumference: 30, wristWidth: 17 },
			general: { ...validGeneral, furType: '' }
		};
		const missingRes = validateCommissionForm(missingFurState);
		expect(missingRes.isValid).toBe(false);
		expect(missingRes.errors.furType).toBeDefined();

		const perPartsImportedState: CommissionFormState = {
			...INITIAL_FORM_STATE,
			commissionPackage: 'per_parts',
			selectedParts: ['head'],
			head: { headCircumference: 56, headHeight: 25 },
			general: { ...validGeneral, furType: 'Imported furs' }
		};
		const importedRes = validateCommissionForm(perPartsImportedState);
		expect(importedRes.isValid).toBe(false);
		expect(importedRes.errors.furType).toBeDefined();
	});

	it('allows Imported furs for Partial and Mini Partial packages', () => {
		const partialImportedState: CommissionFormState = {
			...INITIAL_FORM_STATE,
			commissionPackage: 'partial',
			head: { headCircumference: 56, headHeight: 25 },
			paws: { fingerCount: '5-Finger' },
			tail: { tailSize: 'Standard' },
			armSleeves: { armLength: 55, upperArmCircumference: 30, wristWidth: 17 },
			general: { ...validGeneral, furType: 'Imported furs' }
		};
		const partialRes = validateCommissionForm(partialImportedState);
		expect(partialRes.isValid).toBe(true);

		const miniImportedState: CommissionFormState = {
			...INITIAL_FORM_STATE,
			commissionPackage: 'mini_partial',
			head: { headCircumference: 56, headHeight: 25 },
			paws: { fingerCount: '5-Finger' },
			tail: { tailSize: 'Standard' },
			general: { ...validGeneral, furType: 'Imported furs' }
		};
		const miniRes = validateCommissionForm(miniImportedState);
		expect(miniRes.isValid).toBe(true);
	});

	it('rejects unconverted bundle combinations on per_parts', () => {
		const partialPartsState: CommissionFormState = {
			...INITIAL_FORM_STATE,
			commissionPackage: 'per_parts',
			selectedParts: ['head', 'paws', 'tail', 'arm_sleeves'],
			head: { headCircumference: 56, headHeight: 25 },
			paws: { fingerCount: '5-Finger' },
			tail: { tailSize: 'Standard' },
			armSleeves: { armLength: 55, upperArmCircumference: 30, wristWidth: 17 },
			general: { ...validGeneral }
		};
		const partialRes = validateCommissionForm(partialPartsState);
		expect(partialRes.isValid).toBe(false);
		expect(partialRes.errors.selectedParts).toContain('Partial bundle');

		const miniPartsState: CommissionFormState = {
			...INITIAL_FORM_STATE,
			commissionPackage: 'per_parts',
			selectedParts: ['head', 'paws', 'tail'],
			head: { headCircumference: 56, headHeight: 25 },
			paws: { fingerCount: '5-Finger' },
			tail: { tailSize: 'Standard' },
			general: { ...validGeneral }
		};
		const miniRes = validateCommissionForm(miniPartsState);
		expect(miniRes.isValid).toBe(false);
		expect(miniRes.errors.selectedParts).toContain('Mini Partial bundle');
	});
});
