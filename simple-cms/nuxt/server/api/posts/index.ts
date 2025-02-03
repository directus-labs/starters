import { defineEventHandler, getQuery } from 'h3';
import { directusServer, readItems } from '../../utils/directus-server';

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const limit = parseInt((query.limit as string) || '10', 10);
	const page = parseInt((query.page as string) || '1', 10);

	try {
		const posts = await directusServer.request(
			readItems('posts', {
				limit,
				page,
				sort: ['-published_at'],
				fields: ['id', 'title', 'description', 'slug', 'image'],
				filter: { status: { _eq: 'published' } },
			}),
		);

		return posts;
	} catch {
		throw createError({ statusCode: 500, message: 'Failed to fetch paginated posts' });
	}
});
