import { multipartToFormData, validateFormSubmission } from '@@/app/lib/directus/validateFormSubmission';
import type { Form, FormField } from '@@/shared/types/schema';

interface SubmissionValue {
	field: string;
	value?: string;
	file?: string;
}

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();
	const formData = await readMultipartFormData(event);

	if (!formData) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid form submission',
		});
	}

	const TOKEN = config.directusServerToken as string;

	if (!TOKEN) {
		throw createError({
			statusCode: 500,
			statusMessage: 'DIRECTUS_SERVER_TOKEN is not defined. Check your .env file.',
		});
	}

	let formId = '';

	for (const field of formData) {
		if (field.name === 'formId') {
			formId = field.data.toString();
		}
	}

	if (!formId.trim()) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Missing or invalid formId',
		});
	}

	let fields: FormField[];

	try {
		const form = (await directusServer.request(
			withToken(
				TOKEN,
				readItem('forms', formId.trim(), {
					fields: ['is_active', { fields: ['id', 'name', 'type', 'label', 'required', 'validation'] }],
				}),
			),
		)) as unknown as Form;

		if (!form.is_active || !Array.isArray(form.fields)) {
			throw new Error('Invalid form');
		}

		fields = form.fields.filter((field): field is FormField => typeof field !== 'string');
	} catch {
		throw createError({
			statusCode: 400,
			statusMessage: 'Missing or invalid form',
		});
	}

	const bodyFormData = multipartToFormData(formData);
	const validation = validateFormSubmission(fields, bodyFormData);

	if (!validation.success) {
		throw createError({
			statusCode: 400,
			statusMessage: validation.error,
		});
	}

	try {
		const submissionValues: SubmissionValue[] = [];

		for (const field of fields) {
			if (!field.name) continue;
			const value = validation.data[field.name];
			if (value === undefined || value === null) continue;

			if (field.type === 'file' && value instanceof File) {
				const uploadFormData = new FormData();
				uploadFormData.append('file', value);

				const uploadedFile = (await directusServer.request(withToken(TOKEN, uploadFiles(uploadFormData)))) as {
					id?: string;
				};

				if (uploadedFile?.id) {
					submissionValues.push({
						field: field.id,
						file: uploadedFile.id,
					});
				}
			} else {
				submissionValues.push({
					field: field.id,
					value: String(value),
				});
			}
		}

		const payload = {
			form: formId.trim(),
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
