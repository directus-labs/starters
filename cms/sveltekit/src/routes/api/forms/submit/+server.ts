import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { useDirectus } from '$lib/directus/directus';
import { DIRECTUS_SERVER_TOKEN } from '$env/static/private';

type FormField = { id: string; name: string; type: string };

function isFormField(f: unknown): f is FormField {
	return (
		typeof f === 'object' &&
		f !== null &&
		typeof (f as FormField).id === 'string' &&
		typeof (f as FormField).name === 'string' &&
		typeof (f as FormField).type === 'string'
	);
}

function parseFields(raw: string): FormField[] | Response {
	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) {
			return json({ error: 'fields must be an array' }, { status: 400 });
		}
		if (!parsed.every(isFormField)) {
			return json({ error: 'Each field must have id, name, and type (strings)' }, { status: 400 });
		}
		return parsed;
	} catch {
		return json({ error: 'Invalid fields JSON' }, { status: 400 });
	}
}

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
		const fieldsResult = parseFields(fieldsRaw);
		if (fieldsResult instanceof Response) return fieldsResult;
		const fields = fieldsResult;

		const submissionValues: { field: string; value?: string; file?: string }[] = [];

		for (const field of fields) {
			const value = formData.get(field.name);
			if (value === null || value === undefined) continue;

			if (value instanceof File && value.size > 0) {
				const uploadFormData = new FormData();
				uploadFormData.append('file', value);

				const uploadedFile = await directus.request(withToken(TOKEN, uploadFiles(uploadFormData)));
				if (uploadedFile && 'id' in uploadedFile) {
					submissionValues.push({ field: field.id, file: (uploadedFile as { id: string }).id });
				}
			} else if (typeof value === 'string') {
				submissionValues.push({ field: field.id, value });
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
