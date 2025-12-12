import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getLocaleFromPath } from './lib/i18n/utils';

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Skip middleware for static files, API routes (except search), and Next.js internals
	if (
		pathname.startsWith('/_next') ||
		pathname.startsWith('/api/draft') ||
		pathname.startsWith('/favicon.ico') ||
		pathname.startsWith('/images') ||
		pathname.startsWith('/icons') ||
		pathname.startsWith('/fonts') ||
		pathname.match(/\.(ico|png|jpg|jpeg|svg|woff|woff2|ttf|eot)$/)
	) {
		return NextResponse.next();
	}

	// Extract locale from path
	const { locale, pathWithoutLocale } = getLocaleFromPath(pathname);

	// Create a new URL with the path without locale
	const url = request.nextUrl.clone();
	url.pathname = pathWithoutLocale;

	// Set locale in request headers for server components
	const requestHeaders = new Headers(request.headers);
	requestHeaders.set('x-locale', locale);

	// Rewrite the request to the internal path structure
	const response = NextResponse.rewrite(url, {
		request: {
			headers: requestHeaders,
		},
	});

	// Set locale in response headers for client-side access
	response.headers.set('x-locale', locale);

	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes, but we'll handle search separately)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!api/draft|_next/static|_next/image|favicon.ico).*)',
	],
};
