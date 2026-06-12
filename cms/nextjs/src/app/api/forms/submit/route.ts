import { NextResponse } from 'next/server';
import { submitForm } from '@/lib/directus/forms';
import { parseFormFieldsJson, validateFormSubmission } from '@/lib/directus/validateFormSubmission';
export async function POST(request: Request) {
	const formData = await request.formData();
	const formId = formData.get('formId');

	if (typeof formId !== 'string' || !formId.trim()) {
		return NextResponse.json({ error: 'Missing or invalid formId' }, { status: 400 });
	}

	const fieldsRaw = formData.get('fields');
	if (typeof fieldsRaw !== 'string') {
		return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
	}

	const parsedFields = parseFormFieldsJson(fieldsRaw);
	if ('error' in parsedFields) {
		return NextResponse.json({ error: parsedFields.error }, { status: 400 });
	}

	const validation = validateFormSubmission(parsedFields, formData);
	if (!validation.success) {
		return NextResponse.json({ error: validation.error }, { status: 400 });
	}

	const fieldsForSubmit = parsedFields.map((field) => ({
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
