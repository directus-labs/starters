import { defineEventHandler, getRouterParam } from 'h3';
import { directusServer, readItems } from '../../../utils/directus-server';

export default defineEventHandler(async (event) => {
	const slug = getRouterParam(event, 'slug');

	try {
		const relatedPosts = await directusServer.request(
			readItems('posts', {
				filter: { status: { _eq: 'published' }, slug: { _neq: slug } },
				fields: ['id', 'title', 'image', 'slug'],
				limit: 2,
			}),
		);

		return relatedPosts;
	} catch {
		throw createError({ statusCode: 500, message: 'Failed to fetch related posts' });
	}
});
