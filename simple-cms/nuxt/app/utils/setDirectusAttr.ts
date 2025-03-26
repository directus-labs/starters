export function setAttr({
	collection,
	item,
	fields,
	mode,
}: {
	collection: string;
	item: string | number | undefined | null;
	fields: string | string[];
	mode?: 'drawer' | 'modal' | 'popover';
}): string {
	if (typeof window === 'undefined') return '';
	if (!collection || !item) return '';

	const parts: string[] = [];

	parts.push(`collection:${collection}`);
	parts.push(`item:${item}`);

	const fieldsStr = Array.isArray(fields) ? fields.join(',') : fields;
	parts.push(`fields:${fieldsStr}`);

	if (mode) parts.push(`mode:${mode}`);

	return parts.join(';');
}
