import { fetchRedirects } from './directus/fetchers';
import type { Redirect as NextRedirect } from 'next/dist/lib/load-custom-routes';

export interface RedirectError {
	type: 'redirect';
	destination: string;
	status: string;
}

export function isRedirectError(error: unknown): error is RedirectError {
	return typeof error === 'object' && error !== null && 'type' in error && error.type === 'redirect';
}

export async function generateRedirects(): Promise<NextRedirect[]> {
	try {
		const redirects = await fetchRedirects();

		return redirects
			.filter(
				(redirect): redirect is { url_from: string; url_to: string; response_code: '301' | '302' } =>
					typeof redirect.url_from === 'string' &&
					typeof redirect.url_to === 'string' &&
					(redirect.response_code === '301' || redirect.response_code === '302'),
			)
			.map((redirect) => ({
				source: redirect.url_from,
				destination: redirect.url_to,
				permanent: redirect.response_code === '301',
			}));
	} catch (error) {
		console.error('Error generating redirects:', error);

		return [];
	}
}
