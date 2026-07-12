import { draftMode } from 'next/headers';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const slug = searchParams.get('slug');
	const token = searchParams.get('token');
	const version = searchParams.get('version');

	if (!token || token !== process.env.DIRECTUS_SERVER_TOKEN) {
		return new Response('Invalid token', { status: 401 });
	}

	if (!slug) {
		return new Response('Missing slug', { status: 400 });
	}

	(await draftMode()).enable();

	// Forward the requested content version (e.g. draft) so the page fetches it.
	const location = `/blog/${slug}?preview=true${version ? `&version=${encodeURIComponent(version)}` : ''}`;

	return new Response(null, {
		status: 307,
		headers: {
			Location: location,
		},
	});
}
