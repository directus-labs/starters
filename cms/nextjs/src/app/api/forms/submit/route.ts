import { NextResponse } from 'next/server';
import { submitForm } from '@/lib/directus/forms';
import { validateFormSubmission } from '@/lib/directus/validateFormSubmission';
import { useDirectus } from '@/lib/directus/directus';
import type { FormField } from '@/types/directus-schema';

export async function POST(request: Request) {
	const formData = await request.formData();
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
	const { directus, readItem, withToken } = useDirectus();
	let fields: FormField[];
	try {
		const form = await directus.request(
			withToken(
				TOKEN,
				readItem('forms', formId.trim(), {
					fields: ['id', 'is_active', { fields: ['id', 'name', 'type', 'label', 'required', 'validation'] }],
				} as any),
			),
		);
		if (!(form as any).is_active) {
			return NextResponse.json({ error: 'Form not found' }, { status: 404 });
		}
		fields = ((form as any).fields as FormField[]) || [];
	} catch {
		return NextResponse.json({ error: 'Form not found' }, { status: 404 });
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
