import { buildZodSchema } from '$lib/zodSchemaBuilder';
import type { FormField } from '$lib/types/directus-schema';

/** Matches licensed template Forms policy file upload limit (5 MB). */
export const MAX_FORM_FILE_BYTES = 5 * 1024 * 1024;

export type FormFieldPayload = Pick<FormField, 'id' | 'name' | 'type' | 'label' | 'required' | 'validation'>;

export function parseFormFieldsJson(raw: string): FormFieldPayload[] | { error: string } {
	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) {
			return { error: 'fields must be an array' };
		}
		for (const field of parsed) {
			if (
				typeof field !== 'object' ||
				field === null ||
				typeof field.id !== 'string' ||
				typeof field.name !== 'string' ||
				typeof field.type !== 'string'
			) {
				return { error: 'Each field must include id, name, and type' };
			}
		}
		return parsed as FormFieldPayload[];
	} catch {
		return { error: 'Invalid fields JSON' };
	}
}

function parseFieldValue(field: FormFieldPayload, raw: FormDataEntryValue): unknown {
	if (field.type === 'file') {
		return raw instanceof File ? raw : undefined;
	}
	if (typeof raw !== 'string') {
		return undefined;
	}
	if (field.type === 'checkbox') {
		return raw === 'true';
	}
	if (field.type === 'checkbox_group') {
		try {
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	}
	return raw;
}

export function validateFormSubmission(
	fields: FormFieldPayload[],
	formData: FormData,
): { success: true; data: Record<string, unknown> } | { success: false; error: string } {
	const data: Record<string, unknown> = {};

	for (const field of fields) {
		if (!field.name) continue;
		const raw = formData.get(field.name);
		if (raw === null) continue;

		if (field.type === 'file' && raw instanceof File) {
			if (raw.size > MAX_FORM_FILE_BYTES) {
				return {
					success: false,
					error: `${field.label || field.name} must be ${MAX_FORM_FILE_BYTES / (1024 * 1024)} MB or smaller`,
				};
			}
			if (raw.size > 0) {
				data[field.name] = raw;
			}
			continue;
		}

		const value = parseFieldValue(field, raw);
		if (value !== undefined) {
			data[field.name] = value;
		}
	}

	const schema = buildZodSchema(fields as FormField[]);
	const result = schema.safeParse(data);

	if (!result.success) {
		const first = result.error.issues[0];
		return { success: false, error: first?.message || 'Validation failed' };
	}

	return { success: true, data: result.data as Record<string, unknown> };
}
