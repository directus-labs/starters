import { buildZodSchema } from '@/lib/zodSchemaBuilder';
import type { FormField } from '@/types/directus-schema';
import { z } from 'zod';

/** Leaves room for multipart overhead below Vercel's 4.5 MB request limit. */
export const MAX_FORM_FILE_BYTES = 4 * 1024 * 1024;

const formIdSchema = z.uuid();

/** Returns a canonical Directus UUID or null for untrusted form input. */
export function parseFormId(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') return null;
  const result = formIdSchema.safeParse(value.trim());

  return result.success ? result.data : null;
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
  const totalFileBytes = Array.from(formData.values()).reduce(
    (total, value) => total + (value instanceof File ? value.size : 0),
    0,
  );

  if (totalFileBytes > MAX_FORM_FILE_BYTES) {
    return { success: false, error: 'Combined file uploads must be 4 MB or smaller' };
  }

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

  const schema = buildZodSchema(fields);
  const result = schema.safeParse(data);

  if (!result.success) {
    const first = result.error.issues[0];

    return { success: false, error: first?.message || 'Validation failed' };
  }

  return { success: true, data: result.data as Record<string, unknown> };
}
