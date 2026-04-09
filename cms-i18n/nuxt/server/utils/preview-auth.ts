/**
 * Live preview and versioned reads need the server token so Directus applies the right role (e.g. drafts).
 * Never use `token` from the URL — only `DIRECTUS_SERVER_TOKEN` from runtime config.
 */
export function serverTokenForPreviewOrVersion(
	config: { directusServerToken?: string },
	previewFlag: boolean,
	version: string | undefined,
): string | null {
	const needsElevated = previewFlag || Boolean(version);
	const token = (config.directusServerToken || '').trim();

	if (needsElevated && !token) {
		if (import.meta.dev) {
			// eslint-disable-next-line no-console
			console.warn(
				'[preview] DIRECTUS_SERVER_TOKEN is not set; preview/version content cannot be loaded. Check your environment.',
			);
		}

		// Generic response for visitors — same as missing content (no env details in the client).
		throw createError({ statusCode: 404, statusMessage: 'Page not found' });
	}

	return needsElevated ? token : null;
}
