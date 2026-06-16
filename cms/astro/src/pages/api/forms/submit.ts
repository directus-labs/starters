import type { APIRoute } from 'astro';
import { submitForm, getFormFields } from '@/lib/directus/forms';
import { validateFormSubmission } from '@/lib/directus/validateFormSubmission';

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

  // Fetch the authoritative form field definitions from Directus server-side.
  // This ensures validation rules (required, validation patterns) come from the
  // source of truth rather than client-provided data.
  let fields;
  try {
    fields = await getFormFields(formId.trim());
  } catch {
    return new Response(JSON.stringify({ error: 'Form not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const validation = validateFormSubmission(fields, formData);
  if (!validation.success) {
    return new Response(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const fieldsForSubmit = fields.map((field) => ({
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
