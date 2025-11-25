import { DIRECTUS_SERVER_TOKEN } from '$env/static/private';
import type { FormField, FormSubmission, FormSubmissionValue } from '$lib/types/directus-schema';
import type { RequestEvent } from '@sveltejs/kit';
import { useDirectus } from './directus';
import { fetchFormFields } from './fetchers-forms';


export const submitFormAction = async (event: RequestEvent) => {
	const formData = await event.request.formData();
	const formId = formData.get('formId') as string;

	if (!formId) {
		return { error: 'Form ID is required' };
	}

	// fetch the form and fields config from Directus
	// This is a regular form so we don't have access to the context here.
	const form = await fetchFormFields(formId);

	console.log("SUBMIT FORM", form);

	for (const [key, value] of formData.entries()) {
		console.log(`FormData entry: ${key} =`, value);
	}

	await submitForm(formId, form.fields as FormField[], formData);

	return { success: true };
};

export const submitForm = async (formId: string, fields: FormField[], data: FormData) => {
	const { getDirectus, uploadFiles, createItem, withToken } = useDirectus();
	const TOKEN = DIRECTUS_SERVER_TOKEN;
	const directus = getDirectus(fetch);

	if (!TOKEN) {
		throw new Error('DIRECTUS_SERVER_TOKEN is not defined. Check your .env file.');
	}

	try {
		const submissionValues: Omit<FormSubmissionValue, 'id'>[] = [];

		for (const field of fields) {
			const value = data.get(field.name as string);

			if (value === undefined || value === null) continue;

			// handle any file uploads
			if (field.type === 'file' && value instanceof File) {
				const formData = new FormData();
				formData.append('file', value);

				const uploadedFile = await directus.request(withToken(TOKEN, uploadFiles(formData)));

				if (uploadedFile && 'id' in uploadedFile) {
					submissionValues.push({
						field: field.id,
						file: uploadedFile.id
					});
				}
			} else {
				submissionValues.push({
					field: field.id,
					value: value.toString()
				});
			}
		}

		const payload: Omit<FormSubmission, 'id'> = {
			form: formId,
			values: submissionValues as FormSubmissionValue[] // this shiould be <omit<FormSubmissionValue, 'id'>>[]
		};

		console.log("Form Payload", payload);

		await directus.request(withToken(TOKEN, createItem('form_submissions', payload)));
	} catch (error) {
		console.error('Error submitting form:', error);
		throw new Error('Failed to submit form');
	}
};
