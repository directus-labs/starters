import { draftMode } from 'next/headers';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const slug = searchParams.get('slug');
	const token = searchParams.get('token');

	if (!token || token !== process.env.DRAFT_MODE_SECRET) {
		return new Response('Invalid token', { status: 401 });
	}

	if (!slug) {
		return new Response('Missing slug', { status: 400 });
	}

	(await draftMode()).enable();

	return new Response(null, {
		status: 307,
		headers: {
			Location: `/blog/${slug}?preview=true&token=${token}`,
		},
	});
}
