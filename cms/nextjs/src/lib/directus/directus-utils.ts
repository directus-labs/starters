import { DirectusFile } from '@/types/directus-schema';

/** Map common Directus SDK errors to actionable setup messages. */
export function formatDirectusRequestError(error: unknown, context: string): string {
	if (error && typeof error === 'object' && 'response' in error) {
		const status = (error as { response?: Response }).response?.status;
		if (status === 401) {
			return `${context}: Directus rejected DIRECTUS_SERVER_TOKEN (401). Generate a new static token on your admin user in the Users Directory, update cms/nextjs/.env, and restart pnpm dev.`;
		}
	}

	return `${context}: ${error instanceof Error ? error.message : 'request failed'}`;
}

export function getDirectusAssetURL(fileOrString: string | DirectusFile | null | undefined): string {
	if (!fileOrString) return '';

	if (typeof fileOrString === 'string') {
		return `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${fileOrString}`;
	}

	return `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${fileOrString.id}`;
}
