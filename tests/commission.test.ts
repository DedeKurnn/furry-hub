// @ts-nocheck
import { describe, expect, it } from 'bun:test';
import {
	BASE_PRICES,
	buildSubmissionPayload,
	calculatePriceBreakdown,
	formatIDR,
	getActiveParts,
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
		const std = calculatePriceBreakdown('partial', ['head', 'paws', 'tail', 'arm_sleeves'], 'Standard');
		expect(std.basePrice).toBe(3400000);
		expect(std.tailAdjustment).toBe(0);
		expect(std.totalEstimatedBasePrice).toBe(3400000);
		expect(std.formattedTotal).toBe('Rp 3.400.000');

		// Nub / Small tail (-20% of 600,000 = -120,000)
		const nub = calculatePriceBreakdown('partial', ['head', 'paws', 'tail', 'arm_sleeves'], 'Nub / Small');
		expect(nub.tailAdjustment).toBe(-120000);
		expect(nub.totalEstimatedBasePrice).toBe(3280000);
		expect(nub.formattedTotal).toBe('Rp 3.280.000');

		// Floor-Dragger tail (+20% of 600,000 = +120,000)
		const floor = calculatePriceBreakdown('partial', ['head', 'paws', 'tail', 'arm_sleeves'], 'Floor-Dragger');
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

		const floor = calculatePriceBreakdown('mini_partial', ['head', 'paws', 'tail'], 'Floor-Dragger');
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
});

describe('State cleanup and sanitization', () => {
	it('clears hidden part values when sanitized', () => {
		const state: CommissionFormState = {
			...INITIAL_FORM_STATE,
			commissionPackage: 'mini_partial',
			armSleeves: {
				attachmentStyle: 'Fitted Bicep Elastic',
				length: 'Bicep-Length',
				armLength: 50,
				upperArmCircumference: 28,
				wristWidth: 16
			}
		};

		const sanitized = sanitizeFormState(state);
		// Arm sleeves is hidden in Mini Partial -> must be reset to initial empty
		expect(sanitized.armSleeves).toEqual(INITIAL_ARM_SLEEVES_DATA);
	});

	it('omits inactive parts from submission payload', () => {
		const state: CommissionFormState = {
			...INITIAL_FORM_STATE,
			commissionPackage: 'per_parts',
			selectedParts: ['head'],
			head: {
				eyeStyle: '2D Flat Eyes',
				mouthType: 'Static Open Mouth',
				headAddons: 'None',
				headCircumference: 56,
				headHeight: 25
			},
			// Inactive parts have dummy values
			paws: { fingerCount: '5-Finger' },
			armSleeves: {
				attachmentStyle: 'Fitted Bicep Elastic',
				length: 'Bicep-Length',
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
		furColorCount: '1–2' as const,
		markings: ['Stripes' as const],
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
				eyeStyle: '2D Flat Eyes',
				mouthType: 'Static Open Mouth',
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
				eyeStyle: '2D Flat Eyes',
				mouthType: 'Static Open Mouth',
				headCircumference: 56,
				headHeight: 25
			},
			paws: { fingerCount: '4-Finger' },
			tail: { tailSize: 'Standard', beltAttachment: 'Elastic Belt Loops', tailAddons: [] },
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
				eyeStyle: '2D Flat Eyes',
				mouthType: 'Static Open Mouth',
				headCircumference: 56,
				headHeight: 25
			},
			paws: { fingerCount: '5-Finger' },
			tail: { tailSize: 'Standard', beltAttachment: 'Elastic Belt Loops', tailAddons: [] },
			armSleeves: {
				attachmentStyle: 'Elastic Shoulder/Back Strap',
				length: 'Full Shoulder-Length',
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
});
