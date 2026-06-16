import type { APIRoute } from 'astro';
import { submitForm } from '@/lib/directus/forms';
import { parseFormFieldsJson, validateFormSubmission } from '@/lib/directus/validateFormSubmission';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const formId = formData.get('_formId');

  if (typeof formId !== 'string' || !formId.trim()) {
    return new Response(JSON.stringify({ error: 'Missing or invalid formId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const fieldsRaw = formData.get('_fields');
  if (typeof fieldsRaw !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing or invalid fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const parsedFields = parseFormFieldsJson(fieldsRaw);
  if ('error' in parsedFields) {
    return new Response(JSON.stringify({ error: parsedFields.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const validation = validateFormSubmission(parsedFields, formData);
  if (!validation.success) {
    return new Response(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const fieldsForSubmit = parsedFields.map((field) => ({
    id: field.id,
    name: field.name || '',
    type: field.type || '',
  }));

  try {
    await submitForm(formId.trim(), fieldsForSubmit, validation.data);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error submitting form:', error);

    return new Response(JSON.stringify({ error: 'Failed to submit form' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
