export type CommissionPackage = 'partial' | 'mini_partial' | 'per_parts';

export type PartType = 'head' | 'paws' | 'tail' | 'arm_sleeves';

export type FingerCount = '4-Finger' | '5-Finger';

export type TailSize = 'Nub / Small' | 'Standard' | 'Floor-Dragger';

export type FurType = 'Local faux fur' | 'Imported furs';
export type FurColorCount = '1–2' | '3–4' | '5+';
export type Marking = 'Simple' | 'Complex';
export type ArtisticLiberty =
	| 'Follow ref strictly'
	| 'Allow minor adjustments for fur availability';

export type ContactMethod = 'Discord' | 'Telegram' | 'Email';

export interface HeadData {
	headAddons?: string;
	headCircumference: number | '';
	headHeight: number | '';
}

export interface PawsData {
	fingerCount: FingerCount | '';
}

export interface TailData {
	tailSize: TailSize | '';
}

export interface ArmSleevesData {
	armLength: number | '';
	upperArmCircumference: number | '';
	wristWidth: number | '';
}

export interface GeneralData {
	characterNameSpecies: string;
	refSheetType: 'url' | 'upload';
	refSheetUrl: string;
	refSheetFileName?: string;
	furType: FurType | '';
	furColorCount: FurColorCount | '';
	markings: Marking | '';
	artisticLiberty: ArtisticLiberty | '';
	contactName: string;
	contactMethod: ContactMethod;
	contactValue: string;
	shippingDestination: string;
	agreeToTerms: boolean;
}

export interface CommissionFormState {
	commissionPackage: CommissionPackage;
	selectedParts: PartType[];
	head: HeadData;
	paws: PawsData;
	tail: TailData;
	armSleeves: ArmSleevesData;
	general: GeneralData;
}

export interface PriceBreakdown {
	packageType: CommissionPackage;
	baseName: string;
	basePrice: number;
	partsBreakdown: { name: string; price: number }[];
	tailAdjustment: number;
	totalEstimatedBasePrice: number;
	formattedTotal: string;
}

export interface CommissionSubmissionPayload {
	commissionPackage: CommissionPackage;
	estimatedBasePrice: number;
	formattedPrice: string;
	activeParts: PartType[];
	head?: HeadData;
	paws?: PawsData;
	tail?: TailData;
	armSleeves?: ArmSleevesData;
	general: GeneralData;
	submittedAt: string;
}
