import type { APIRoute } from 'astro';
import { getFormDefinition, submitForm } from '@/lib/directus/forms';
import { getDirectusErrorStatus } from '@/lib/directus/errors';
import { parseFormId, validateFormSubmission } from '@/lib/directus/validateFormSubmission';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const formId = parseFormId(formData.get('_formId'));

  if (!formId) {
    return new Response(JSON.stringify({ error: 'Missing or invalid formId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Fetch the authoritative form field definitions from Directus server-side.
  // This ensures validation rules (required, validation patterns) come from the
  // source of truth rather than client-provided data.
  let definition;
  try {
    definition = await getFormDefinition(formId);
  } catch (error) {
    const status = getDirectusErrorStatus(error);
    const responseStatus = status === 404 ? 404 : 503;

    return new Response(
      JSON.stringify({ error: responseStatus === 404 ? 'Form not found' : 'Unable to validate form' }),
      {
        status: responseStatus,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  if (!definition.isActive) {
    return new Response(JSON.stringify({ error: 'Form not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const validation = validateFormSubmission(definition.fields, formData);
  if (!validation.success) {
    return new Response(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const fieldsForSubmit = definition.fields.map((field) => ({
    id: field.id,
    name: field.name || '',
    type: field.type || '',
  }));

  try {
    await submitForm(formId, fieldsForSubmit, validation.data);

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
