export function getDirectusAssetURL(fileOrString: string | { id: string } | null | undefined): string {
	if (!fileOrString) return '';

	if (typeof fileOrString === 'string') {
		return `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${fileOrString}`;
	}

	return `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${fileOrString.id}`;
}
