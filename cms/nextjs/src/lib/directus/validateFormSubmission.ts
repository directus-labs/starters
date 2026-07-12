import { buildZodSchema } from '@/lib/zodSchemaBuilder';
import type { FormField } from '@/types/directus-schema';

/** Matches licensed template Forms policy file upload limit (5 MB). */
export const MAX_FORM_FILE_BYTES = 5_000_000;

/** Allows up to five maximum-sized files plus multipart field overhead. */
export const MAX_FORM_REQUEST_BYTES = MAX_FORM_FILE_BYTES * 5 + 1_000_000;
export const MAX_FORM_REQUEST_ENTRIES = 100;

type ParseFormRequestResult =
	| { success: true; data: FormData }
	| { success: false; error: string; status: 400 | 413 };

export async function parseFormRequest(request: Request): Promise<ParseFormRequestResult> {
	const contentLength = Number(request.headers.get('content-length'));
	if (Number.isFinite(contentLength) && contentLength > MAX_FORM_REQUEST_BYTES) {
		return { success: false, error: 'Form submission is too large', status: 413 };
	}

	let formData: FormData;
	try {
		formData = await request.formData();
	} catch {
		return { success: false, error: 'Invalid form submission', status: 400 };
	}

	let entryCount = 0;
	let payloadBytes = 0;
	for (const [, value] of formData) {
		entryCount++;
		payloadBytes += typeof value === 'string' ? new TextEncoder().encode(value).byteLength : value.size;

		if (entryCount > MAX_FORM_REQUEST_ENTRIES || payloadBytes > MAX_FORM_REQUEST_BYTES) {
			return { success: false, error: 'Form submission is too large', status: 413 };
		}
	}

	return { success: true, data: formData };
}

function parseFieldValue(field: FormField, raw: FormDataEntryValue): unknown {
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
	fields: FormField[],
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
					error: `${field.label || field.name} must be 5 MB or smaller`,
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

	const schema = buildZodSchema(fields);
	const result = schema.safeParse(data);

	if (!result.success) {
		const first = result.error.issues[0];

		return { success: false, error: first?.message || 'Validation failed' };
	}

	return { success: true, data: result.data as Record<string, unknown> };
}
