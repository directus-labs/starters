import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { useDirectus } from '$lib/directus/directus';
import { DIRECTUS_SERVER_TOKEN } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) => {
	const { getDirectus, uploadFiles, createItem, withToken } = useDirectus();
	const directus = getDirectus();
	const TOKEN = DIRECTUS_SERVER_TOKEN;

	if (!TOKEN) {
		return json({ error: 'DIRECTUS_SERVER_TOKEN is not defined. Check your .env file.' }, { status: 500 });
	}

	try {
		const formData = await request.formData();
		const formId = formData.get('formId') as string;
		const fields = JSON.parse(formData.get('fields') as string) as {
			id: string;
			name: string;
			type: string;
		}[];

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
			withToken(TOKEN, createItem('form_submissions', { form: formId, values: submissionValues }))
		);

		return json({ success: true });
	} catch (error) {
		console.error('Error submitting form:', error);
		return json({ error: 'Failed to submit form' }, { status: 500 });
	}
};
