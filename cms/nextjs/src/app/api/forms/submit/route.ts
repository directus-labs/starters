import { NextResponse } from 'next/server';
import { submitForm } from '@/lib/directus/forms';
import { parseFormRequest, validateFormSubmission } from '@/lib/directus/validateFormSubmission';
import { useDirectus } from '@/lib/directus/directus';
import type { FormField } from '@/types/directus-schema';

export async function POST(request: Request) {
	const parsedRequest = await parseFormRequest(request);
	if (!parsedRequest.success) {
		return NextResponse.json({ error: parsedRequest.error }, { status: parsedRequest.status });
	}

	const formData = parsedRequest.data;
	const formId = formData.get('formId');

	if (typeof formId !== 'string' || !formId.trim()) {
		return NextResponse.json({ error: 'Missing or invalid formId' }, { status: 400 });
	}

	const TOKEN = process.env.DIRECTUS_SERVER_TOKEN;
	if (!TOKEN) {
		return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
	}

	// Fetch the authoritative form field definitions from Directus server-side.
	// This ensures validation rules (required, validation patterns) come from the
	// source of truth rather than client-provided data.
	const { directus, readItem } = useDirectus();
	let fields: FormField[];
	try {
		// Public policy restricts this read to active forms; the server token only needs submission permissions.
		const form = await directus.request(
			readItem('forms', formId.trim(), {
				fields: ['is_active', { fields: ['id', 'name', 'type', 'label', 'required', 'validation', 'choices'] }],
			} as any),
		);

		if (!(form as any).is_active || !Array.isArray((form as any).fields)) {
			return NextResponse.json({ error: 'Missing or invalid form' }, { status: 400 });
		}

		fields = ((form as any).fields as FormField[]).filter((field): field is FormField => typeof field !== 'string');
	} catch {
		return NextResponse.json({ error: 'Missing or invalid form' }, { status: 400 });
	}

	const validation = validateFormSubmission(fields, formData);
	if (!validation.success) {
		return NextResponse.json({ error: validation.error }, { status: 400 });
	}

	const fieldsForSubmit = fields.map((field) => ({
		id: field.id,
		name: field.name || '',
		type: field.type || '',
	}));

	try {
		await submitForm(formId.trim(), fieldsForSubmit, validation.data);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error submitting form:', error);

		return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
	}
}
