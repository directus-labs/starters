import { z } from 'zod';
import type { FormField } from '@/types/directus-schema';

export const buildZodSchema = (fields: FormField[]) => {
  const schema: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny;
    const label = field.label || field.name;
    const allowedChoices = new Set(field.choices?.map((choice) => choice.value) ?? []);

    switch (field.type) {
      case 'checkbox':
        fieldSchema = z.boolean().default(false);
        if (field.required) {
          fieldSchema = fieldSchema.refine((value) => value === true, `${label} is required`);
        }
        break;

      case 'checkbox_group':
        fieldSchema = z.array(z.string()).default([]);
        if (field.required) {
          fieldSchema = fieldSchema.refine((value) => Array.isArray(value) && value.length > 0, `${label} is required`);
        }
        if (allowedChoices.size > 0) {
          fieldSchema = fieldSchema.refine(
            (value) =>
              Array.isArray(value) && value.every((choice) => typeof choice === 'string' && allowedChoices.has(choice)),
            `${label} contains an invalid option`,
          );
        }
        break;

      case 'radio':
      case 'select':
        fieldSchema = z.string();
        break;

      case 'file':
        if (field.required) {
          fieldSchema = z.instanceof(File, {
            message: `${label} is required`,
          });
        } else {
          fieldSchema = z
            .instanceof(File, {
              message: `${label} must be a valid file if provided`,
            })
            .or(z.undefined());
        }

        break;

      default:
        fieldSchema = z.string();
        break;
    }

    if (field.validation) {
      const rules = field.validation.split('|');

      for (const rule of rules) {
        const [ruleName, ruleValue] = rule.split(':');
        const normalizedRule = ruleName.toLowerCase();

        if (fieldSchema instanceof z.ZodString) {
          switch (normalizedRule) {
            case 'email':
              fieldSchema = fieldSchema.email({
                message: `${field.label || field.name} must be a valid email`,
              });
              break;

            case 'url':
              fieldSchema = fieldSchema.url({
                message: `${field.label || field.name} must be a valid URL`,
              });
              break;

            case 'min': {
              const min = parseInt(ruleValue, 10);
              fieldSchema = fieldSchema.min(min, `${field.label || field.name} must be at least ${min} characters`);
              break;
            }

            case 'max': {
              const max = parseInt(ruleValue, 10);
              fieldSchema = fieldSchema.max(max, `${field.label || field.name} must be at most ${max} characters`);
              break;
            }

            case 'length': {
              const length = parseInt(ruleValue, 10);

              fieldSchema = fieldSchema.length(
                length,
                `${field.label || field.name} must be exactly ${length} characters`,
              );

              break;
            }

            default:
              if (import.meta.env.DEV) {
                console.warn(`Unknown validation rule: ${ruleName}`);
              }
          }
        }
      }
    }

    if (field.required) {
      if (fieldSchema instanceof z.ZodString) {
        fieldSchema = fieldSchema.min(1, `${field.label || field.name} is required`);
      }
    } else {
      fieldSchema = fieldSchema.or(z.literal('')).or(z.undefined());
    }

    if ((field.type === 'radio' || field.type === 'select') && allowedChoices.size > 0) {
      fieldSchema = fieldSchema.refine(
        (value) => value === undefined || value === '' || (typeof value === 'string' && allowedChoices.has(value)),
        `${label} is invalid`,
      );
    }

    if (field.name) {
      schema[field.name] = fieldSchema;
    }
  }

  return z.object(schema);
};
