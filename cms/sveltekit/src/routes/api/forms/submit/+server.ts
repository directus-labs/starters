import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { useDirectus } from '$lib/directus/directus';
import { DIRECTUS_SERVER_TOKEN } from '$env/static/private';
import { parseFormFieldsJson, validateFormSubmission } from '$lib/directus/validateFormSubmission';

export const POST: RequestHandler = async ({ request }) => {
	const { getDirectus, uploadFiles, createItem, withToken } = useDirectus();
	const directus = getDirectus();
	const TOKEN = DIRECTUS_SERVER_TOKEN;

	if (!TOKEN) {
		return json(
			{ error: 'DIRECTUS_SERVER_TOKEN is not defined. Check your .env file.' },
			{ status: 500 }
		);
	}

	try {
		const formData = await request.formData();
		const formId = formData.get('formId');
		if (typeof formId !== 'string' || !formId.trim()) {
			return json({ error: 'Missing or invalid formId' }, { status: 400 });
		}

		const fieldsRaw = formData.get('fields');
		if (typeof fieldsRaw !== 'string') {
			return json({ error: 'Missing or invalid fields' }, { status: 400 });
		}

		const parsedFields = parseFormFieldsJson(fieldsRaw);
		if ('error' in parsedFields) {
			return json({ error: parsedFields.error }, { status: 400 });
		}

		const validation = validateFormSubmission(parsedFields, formData);
		if (!validation.success) {
			return json({ error: validation.error }, { status: 400 });
		}

		const submissionValues: { field: string; value?: string; file?: string }[] = [];

		for (const field of parsedFields) {
			if (!field.name) continue;
			const value = validation.data[field.name];
			if (value === undefined || value === null) continue;

			if (field.type === 'file' && value instanceof File) {
				const uploadFormData = new FormData();
				uploadFormData.append('file', value);

				const uploadedFile = await directus.request(withToken(TOKEN, uploadFiles(uploadFormData)));
				if (uploadedFile && 'id' in uploadedFile) {
					submissionValues.push({ field: field.id, file: (uploadedFile as { id: string }).id });
				}
			} else {
				submissionValues.push({ field: field.id, value: String(value) });
			}
		}

		await directus.request(
			withToken(TOKEN, createItem('form_submissions', { form: formId.trim(), values: submissionValues }))
		);

		return json({ success: true });
	} catch (error) {
		console.error('Error submitting form:', error);
		return json({ error: 'Failed to submit form' }, { status: 500 });
	}
};
