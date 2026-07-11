import { useDirectus } from './directus';
import type { FormField, FormSubmissionValue } from '@/types/directus-schema';

/** Canonical server-side form state used to authorize and validate submissions. */
export interface FormDefinition {
  isActive: boolean;
  fields: FormField[];
}

/** Server-only — fetches the canonical status and field definitions for a form from Directus. */
export const getFormDefinition = async (formId: string): Promise<FormDefinition> => {
  const { directus, readItem, withToken } = useDirectus();
  const TOKEN = import.meta.env.DIRECTUS_SERVER_TOKEN;

  if (!TOKEN) {
    throw new Error('DIRECTUS_SERVER_TOKEN is not defined. Check your .env file.');
  }

  const form: unknown = await directus.request(
    withToken(
      TOKEN,
      readItem('forms', formId, {
        fields: ['is_active', { fields: ['id', 'name', 'type', 'label', 'required', 'validation', 'choices'] }],
      } as any),
    ),
  );

  if (typeof form !== 'object' || form === null || !('fields' in form)) {
    throw new Error('Directus returned an invalid form definition');
  }

  const fields = form.fields;
  if (!Array.isArray(fields)) {
    throw new Error('Directus returned an invalid form definition');
  }

  if (
    fields.some(
      (field) => typeof field !== 'object' || field === null || !('id' in field) || typeof field.id !== 'string',
    )
  ) {
    throw new Error('Directus returned invalid form fields');
  }

  return {
    isActive: 'is_active' in form && form.is_active === true,
    fields: fields as FormField[],
  };
};

/** Server-only — call from API routes, not client components. */
export const submitForm = async (
  formId: string,
  fields: { id: string; name: string; type: string }[],
  data: Record<string, any>,
) => {
  const { directus, uploadFiles, deleteFile, createItem, withToken } = useDirectus();
  const TOKEN = import.meta.env.DIRECTUS_SERVER_TOKEN;

  if (!TOKEN) {
    throw new Error('DIRECTUS_SERVER_TOKEN is not defined. Check your .env file.');
  }

  const uploadedFileIds: string[] = [];

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
          uploadedFileIds.push(uploadedFile.id);
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
    await Promise.allSettled(uploadedFileIds.map((fileId) => directus.request(withToken(TOKEN, deleteFile(fileId)))));

    throw new Error('Failed to submit form');
  }
};
