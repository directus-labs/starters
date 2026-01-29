/**
 * Extracts locale from URL and sets x-locale header. Rewrites URL to remove locale prefix.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getLocaleFromPath } from './lib/i18n/utils';

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (
		pathname.startsWith('/_next') ||
		pathname.startsWith('/favicon.ico') ||
		pathname.startsWith('/images') ||
		pathname.startsWith('/icons') ||
		pathname.startsWith('/fonts') ||
		pathname.match(/\.(ico|png|jpg|jpeg|svg|woff|woff2|ttf|eot)$/)
	) {
		return NextResponse.next();
	}

	const { locale, pathWithoutLocale } = getLocaleFromPath(pathname);

	const url = request.nextUrl.clone();
	url.pathname = pathWithoutLocale;

	const requestHeaders = new Headers(request.headers);
	requestHeaders.set('x-locale', locale);

	const response = NextResponse.rewrite(url, {
		request: {
			headers: requestHeaders,
		},
	});

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
