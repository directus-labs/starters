import { defineEventHandler, getRouterParam } from 'h3';

export default defineEventHandler(async (event) => {
	const slug = getRouterParam(event, 'slug');

	try {
		const posts = await directusServer.request(
			readItems('posts', {
				filter: { slug: { _eq: slug }, status: { _eq: 'published' } },
				limit: 1,
				fields: ['id', 'title', 'content', 'status', 'image', 'description', 'author'],
			}),
		);

		if (!posts.length) {
			throw createError({ statusCode: 404, message: `Post not found: ${slug}` });
		}

		return posts[0];
	} catch {
		throw createError({ statusCode: 500, message: `Failed to fetch post: ${slug}` });
	}
});
