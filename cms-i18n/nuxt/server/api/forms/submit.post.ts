import {
	multipartToFormData,
	parseFormFieldsJson,
	validateFormSubmission,
} from '@@/app/lib/directus/validateFormSubmission';

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
	let fieldsRaw = '';

	for (const field of formData) {
		if (field.name === 'formId') {
			formId = field.data.toString();
		} else if (field.name === 'fields') {
			fieldsRaw = field.data.toString();
		}
	}

	if (!formId.trim()) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Missing or invalid formId',
		});
	}

	const parsedFields = parseFormFieldsJson(fieldsRaw);
	if ('error' in parsedFields) {
		throw createError({
			statusCode: 400,
			statusMessage: parsedFields.error,
		});
	}

	const bodyFormData = multipartToFormData(formData);
	const validation = validateFormSubmission(parsedFields, bodyFormData);

	if (!validation.success) {
		throw createError({
			statusCode: 400,
			statusMessage: validation.error,
		});
	}

	try {
		const submissionValues: SubmissionValue[] = [];

		for (const field of parsedFields) {
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
