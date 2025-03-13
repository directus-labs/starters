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

	try {
		const submissionValues: SubmissionValue[] = [];
		let formId = '';
		let fields = [];

		for (const field of formData) {
			if (field.name === 'formId') {
				formId = field.data.toString();
			} else if (field.name === 'fields') {
				fields = JSON.parse(field.data.toString());
			}
		}

		for (const field of formData) {
			if (!field.name || !field.data) continue;
			if (field.name === 'formId' || field.name === 'fields') continue;

			const matchingField = fields.find((f: { name: string | undefined }) => f.name === field.name);
			if (!matchingField) continue;

			if (field.filename) {
				const blob = new Blob([field.data], { type: field.type });

				const uploadFormData = new FormData();
				uploadFormData.append('file', blob, field.filename);

				const uploadedFile = (await directusServer.request(withToken(TOKEN, uploadFiles(uploadFormData)))) as {
					id?: string;
				};

				if (uploadedFile?.id) {
					submissionValues.push({
						field: matchingField.id,
						file: uploadedFile.id,
					});
				}
			} else {
				submissionValues.push({
					field: matchingField.id,
					value: field.data.toString(),
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
