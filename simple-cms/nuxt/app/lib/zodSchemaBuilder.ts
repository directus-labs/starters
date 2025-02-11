import { z } from 'zod';
import type { FormField } from '@@/shared/types/schema';

export const buildZodSchema = (fields: FormField[]) => {
	const shape: Record<string, z.ZodTypeAny> = {};

	fields.forEach((field) => {
		const fieldType = (field.type || 'string').toLowerCase();
		const description = field.label || field.name || field.id;

		let fieldSchema: z.ZodTypeAny;

		switch (fieldType) {
			case 'checkbox':
				fieldSchema = z.boolean().default(false).describe(description);
				break;

			case 'checkbox_group':
				fieldSchema = z.array(z.string()).default([]).describe(description);
				break;

			case 'radio':
				if (field.choices && field.choices.length > 0) {
					const enumValues = field.choices.map((choice) => choice.value);
					fieldSchema = z.enum(enumValues as [string, ...string[]]).describe(description);
				} else {
					fieldSchema = z.string().describe(description);
				}

				break;

			case 'file':
				if (field.required) {
					fieldSchema = z.instanceof(File, { message: `${description} is required` }).describe(description);
				} else {
					fieldSchema = z
						.instanceof(File, { message: `${description} must be a valid file if provided` })
						.or(z.undefined())
						.describe(description);
				}

				break;

			case 'textarea':
				fieldSchema = z.string().describe(description);
				break;

			case 'hidden':
				fieldSchema = z.string().describe(description);
				break;

			case 'number':
				fieldSchema = z
					.preprocess((a) => {
						if (typeof a === 'string' || typeof a === 'number') return Number(a);
						return a;
					}, z.number())
					.describe(description);
				break;

			case 'date':
				fieldSchema = z
					.preprocess((a) => {
						if (typeof a === 'string' || a instanceof Date) return new Date(a);
						return a;
					}, z.date())
					.describe(description);
				break;

			case 'select':
				if (field.choices && field.choices.length > 0) {
					const enumValues = field.choices.map((choice) => choice.value);
					fieldSchema = z.enum(enumValues as [string, ...string[]]).describe(description);
				} else {
					fieldSchema = z.string().describe(description);
				}

				break;

			default:
				fieldSchema = z.string().describe(description);
				break;
		}

		// For non-file fields, mark as optional if not required.
		if (fieldType !== 'file') {
			if (!field.required) {
				fieldSchema = fieldSchema.optional();
			} else if (fieldSchema instanceof z.ZodString) {
				fieldSchema = fieldSchema.nonempty(`${description} is required`);
			}
		}

		shape[field.name || field.id] = fieldSchema;
	});

	return z.object(shape);
};
