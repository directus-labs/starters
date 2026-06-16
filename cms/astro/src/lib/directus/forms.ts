import { useDirectus } from './directus';
import type { FormField, FormSubmissionValue } from '@/types/directus-schema';

/** Server-only — fetches the canonical field definitions for a form from Directus. */
export const getFormFields = async (formId: string): Promise<FormField[]> => {
  const { directus, readItem, withToken } = useDirectus();
  const TOKEN = import.meta.env.DIRECTUS_SERVER_TOKEN;

  if (!TOKEN) {
    throw new Error('DIRECTUS_SERVER_TOKEN is not defined. Check your .env file.');
  }

  const form = await directus.request(
    withToken(
      TOKEN,
      readItem('forms', formId, {
        fields: [{ fields: ['id', 'name', 'type', 'label', 'required', 'validation'] }],
      } as any),
    ),
  );

  return ((form as any).fields as FormField[]) || [];
};

/** Server-only — call from API routes, not client components. */
export const submitForm = async (
  formId: string,
  fields: { id: string; name: string; type: string }[],
  data: Record<string, any>,
) => {
  const { directus, uploadFiles, createItem, withToken } = useDirectus();
  const TOKEN = import.meta.env.DIRECTUS_SERVER_TOKEN;

  if (!TOKEN) {
    throw new Error('DIRECTUS_SERVER_TOKEN is not defined. Check your .env file.');
  }

  try {
    const submissionValues: FormSubmissionValue[] = [];

    for (const field of fields) {
      const value = data[field.name];

      if (value === undefined || value === null) continue;

      if (field.type === 'file' && value instanceof File) {
        const formData = new FormData();
        formData.append('file', value);

        const uploadedFile = await directus.request(withToken(TOKEN, uploadFiles(formData)));

        if (uploadedFile && 'id' in uploadedFile) {
          submissionValues.push({
            field: field.id,
            file: uploadedFile.id,
          });
        }
      } else {
        submissionValues.push({
          field: field.id,
          value: value.toString(),
        });
      }
    }

    const payload = {
      form: formId,
      values: submissionValues,
    };

    await directus.request(withToken(TOKEN, createItem('form_submissions', payload)));
  } catch {
    throw new Error('Failed to submit form');
  }
};
