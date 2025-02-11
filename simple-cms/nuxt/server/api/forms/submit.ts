import { defineEventHandler, createError, readBody } from 'h3';
import { uploadFiles, createItem, withToken, directusServer } from '../../utils/directus-server';

interface SubmissionValue {
	field: string;
	value?: string;
	file?: string;
}

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const { formId, fields, data } = body;

	const TOKEN = process.env.DIRECTUS_FORM_TOKEN;

	if (!TOKEN) {
		throw createError({
			statusCode: 500,
			statusMessage: 'DIRECTUS_FORM_TOKEN is not defined. Check your .env file.',
		});
	}

	try {
		const submissionValues: SubmissionValue[] = [];

		for (const field of fields) {
			const value = data[field.name];
			if (value === undefined || value === null) continue;

			if (field.type === 'file' && value instanceof File) {
				const formData = new FormData();
				formData.append('file', value);

				const uploadedFile = (await directusServer.request(withToken(TOKEN, uploadFiles(formData)))) as { id?: string };

				if (uploadedFile && typeof uploadedFile === 'object' && 'id' in uploadedFile && uploadedFile.id) {
					submissionValues.push({
						field: field.id,
						file: uploadedFile.id,
					});
				}
			} else {
				submissionValues.push({
					field: field.id,
					value: value.toString(),
				});
			}
		}

		const payload = {
			form: formId,
			values: submissionValues,
		};

		await directusServer.request(withToken(TOKEN, createItem('form_submissions', payload)));

		return { success: true };
	} catch {
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}
});
