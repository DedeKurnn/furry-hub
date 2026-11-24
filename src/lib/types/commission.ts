export type CommissionPackage = 'partial' | 'mini_partial' | 'per_parts';

export type PartType = 'head' | 'paws' | 'tail' | 'arm_sleeves';

export type EyeStyle = '2D Flat Eyes' | '3D Follow-Me Eyes';
export type MouthType = 'Static Open Mouth' | 'Closed Mouth';

export type FingerCount = '4-Finger' | '5-Finger';

export type TailSize = 'Nub / Small' | 'Standard' | 'Floor-Dragger';
export type BeltAttachment = 'Elastic Belt Loops' | 'Hidden Nylon Kidney Belt';
export type TailAddon = 'Squeaker' | 'Removable stuffing zipper/velcro';

export type ArmSleeveAttachment = 'Elastic Shoulder/Back Strap' | 'Fitted Bicep Elastic';
export type ArmSleeveLength = 'Bicep-Length' | 'Full Shoulder-Length';

export type FurColorCount = '1–2' | '3–4' | '5+';
export type Marking = 'Stripes' | 'Spots' | 'Gradients / Airbrushing' | 'Asymmetrical Design';
export type ArtisticLiberty =
	| 'Follow ref strictly'
	| 'Allow minor adjustments for fur availability';

export type ContactMethod = 'Discord' | 'Telegram' | 'Email';

export interface HeadData {
	eyeStyle: EyeStyle | '';
	mouthType: MouthType | '';
	headAddons?: string;
	headCircumference: number | '';
	headHeight: number | '';
}

export interface PawsData {
	fingerCount: FingerCount | '';
}

export interface TailData {
	tailSize: TailSize | '';
	beltAttachment: BeltAttachment | '';
	tailAddons: TailAddon[];
}

export interface ArmSleevesData {
	attachmentStyle: ArmSleeveAttachment | '';
	length: ArmSleeveLength | '';
	armLength: number | '';
	upperArmCircumference: number | '';
	wristWidth: number | '';
}

export interface GeneralData {
	characterNameSpecies: string;
	refSheetType: 'url' | 'upload';
	refSheetUrl: string;
	refSheetFileName?: string;
	furColorCount: FurColorCount | '';
	markings: Marking[];
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
