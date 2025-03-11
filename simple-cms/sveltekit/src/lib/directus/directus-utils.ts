import { PUBLIC_DIRECTUS_URL } from '$env/static/public';
import { type DirectusFile } from '../types/directus-schema';

export function getDirectusAssetURL(
	fileOrString: string | DirectusFile | null | undefined
): string {
	if (!fileOrString) return '';

	if (typeof fileOrString === 'string') {
		return `${PUBLIC_DIRECTUS_URL}/assets/${fileOrString}`;
	}

	return `${PUBLIC_DIRECTUS_URL}/assets/${fileOrString.id}`;
}
