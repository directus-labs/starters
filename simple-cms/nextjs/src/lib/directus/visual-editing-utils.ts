/**
 * Server-safe implementation of the Directus setAttr function.
 *
 * This function formats the Directus edit configuration into the attribute string format
 * needed for the data-directus attribute without relying on the client-side library.
 */
export function setAttr(config: {
	collection: string;
	item: string | number;
	fields: string | string[];
	mode?: 'drawer' | 'modal' | 'popover';
}): string {
	const { collection, item, fields, mode } = config;
	const parts: string[] = [];

	if (collection) parts.push(`collection:${collection}`);
	if (item) parts.push(`item:${item}`);

	if (fields) {
		const fieldsStr = Array.isArray(fields) ? fields.join(',') : fields;
		parts.push(`fields:${fieldsStr}`);
	}

	if (mode) parts.push(`mode:${mode}`);

	return parts.join(';');
}
