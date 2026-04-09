import { draftMode } from 'next/headers';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const slug = searchParams.get('slug');

	if (!slug) {
		return new Response('Missing slug', { status: 400 });
	}

	// Ignore `token` in the query string. Preview content uses DIRECTUS_SERVER_TOKEN on server routes.

	(await draftMode()).enable();

	return new Response(null, {
		status: 307,
		headers: {
			Location: `/blog/${slug}?preview=true`,
		},
	});
}
