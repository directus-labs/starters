/**
 * Directus live preview may append `?token=…` to the site URL. We never use it for auth here—
 * preview uses DIRECTUS_SERVER_TOKEN on the server only. These helpers normalize `preview` / `version`
 * / `id` so boolean vs string query values and duplicate keys do not break fetches.
 */
export function firstQueryValue(value: unknown): string | undefined {
	if (value === undefined || value === null) return undefined;
	if (Array.isArray(value)) {
		const first = value[0];
		if (first === undefined || first === null) return undefined;
		return String(first);
	}

	return String(value);
}

export function isPreviewQueryValue(preview: unknown): boolean {
	if (preview === true || preview === 1) return true;
	if (typeof preview === 'string') {
		const s = preview.toLowerCase();
		return s === 'true' || s === '1';
	}

	if (Array.isArray(preview)) return preview.some(isPreviewQueryValue);
	return false;
}

export function normalizeVersionQuery(version: unknown): string | undefined {
	const v = firstQueryValue(version);
	if (!v || v === 'main') return undefined;
	return v;
}
