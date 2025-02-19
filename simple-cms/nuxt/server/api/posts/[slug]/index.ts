import { defineEventHandler, getRouterParam, getQuery } from 'h3';
import { directusServer, type QueryFilter } from '../../../utils/directus-server';

export default defineEventHandler(async (event) => {
	const slug = getRouterParam(event, 'slug');
	const query = getQuery(event);
	const isPreview = query.preview === 'true';

	try {
		const filter: QueryFilter<Schema, Post> = isPreview
			? { slug: { _eq: slug } }
			: { slug: { _eq: slug }, status: { _eq: 'published' } };

		const posts = await directusServer.request(
			readItems('posts', {
				filter,
				limit: 1,
				fields: ['id', 'title', 'content', 'status', 'image', 'description', 'author', 'seo'],
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
