import type { TypedSchema, TypedSchemaError } from 'vee-validate';
import type { z } from 'zod';

/**
 * Adapts a Zod 4 schema to vee-validate's TypedSchema.
 *
 * @vee-validate/zod only supports Zod 3, so this does the same job for Zod 4: run the schema
 * and group Zod's issues by field path, in the shape vee-validate expects.
 */
export function toTypedSchema<TSchema extends z.ZodType>(schema: TSchema): TypedSchema<z.input<TSchema>, z.output<TSchema>> {
	return {
		__type: 'VVTypedSchema',
		async parse(values) {
			const result = await schema.safeParseAsync(values);

			if (result.success) {
				return { value: result.data, errors: [] };
			}

			const errorsByPath = new Map<string, TypedSchemaError>();

			for (const issue of result.error.issues) {
				// vee-validate paths use dots for object keys and brackets for array indexes: "items[0].name"
				const path = issue.path
					.map((key, index) => (typeof key === 'number' ? `[${key}]` : index === 0 ? String(key) : `.${String(key)}`))
					.join('');
				const entry = errorsByPath.get(path) ?? { path, errors: [] };
				entry.errors.push(issue.message);
				errorsByPath.set(path, entry);
			}

			return { errors: [...errorsByPath.values()] };
		},
	};
}
