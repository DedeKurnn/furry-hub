import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { CommissionFormState, PartType } from '$lib/types/commission';
import {
	buildSubmissionPayload,
	INITIAL_FORM_STATE,
	validateCommissionForm
} from '$lib/utils/commission';

export const load: PageServerLoad = async () => {
	return {
		initialState: INITIAL_FORM_STATE
	};
};

export const actions: Actions = {
	submitQuote: async ({ request }) => {
		const formData = await request.formData();
		const rawStateJson = formData.get('statePayload');

		if (!rawStateJson || typeof rawStateJson !== 'string') {
			return fail(400, {
				success: false,
				error: 'Invalid submission payload.'
			});
		}

		try {
			const parsedState: CommissionFormState = JSON.parse(rawStateJson);
			const validation = validateCommissionForm(parsedState);

			if (!validation.isValid) {
				return fail(400, {
					success: false,
					errors: validation.errors
				});
			}

			const payload = buildSubmissionPayload(parsedState);

			return {
				success: true,
				payload
			};
		} catch (err) {
			console.error('Commission quote submission parse error:', err);
			return fail(400, {
				success: false,
				error: 'Could not process form submission.'
			});
		}
	}
};
