import type { Redirect } from '@/types/directus-schema';

export interface RedirectError {
	type: 'redirect';
	destination: string;
	status: NonNullable<Redirect['response_code']>;
}

export function isRedirectError(error: unknown): error is RedirectError {
	return (
		typeof error === 'object' &&
		error !== null &&
		'type' in error &&
		error.type === 'redirect' &&
		'destination' in error &&
		typeof error.destination === 'string' &&
		'status' in error &&
		(error.status === '301' || error.status === '302')
	);
}
