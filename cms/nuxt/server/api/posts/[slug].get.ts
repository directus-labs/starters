import type { Post } from '#shared/types/schema';

export default defineEventHandler(async (event) => {
	const slug = getRouterParam(event, 'slug');

	if (!slug) {
		throw createError({ statusCode: 400, message: 'Slug is required' });
	}

	const query = getQuery(event);
	const { preview, token: rawToken, id, version } = query;
	const token = (preview === 'true' && rawToken) || rawToken ? String(rawToken) : null;

	try {
		let post: Post;
		let postId = id as string;

		if (version && !postId) {
			const postIdLookup = await directusServer.request(
				withToken(
					token as string,
					readItems('posts', {
						filter: { slug: { _eq: slug } },
						limit: 1,
						fields: ['id'],
					}),
				),
			);
			postId = postIdLookup.length > 0 ? postIdLookup[0]?.id || '' : '';
		}

		const postFields = [
			'id',
			'title',
			'content',
			'status',
			'published_at',
			'image',
			'description',
			'slug',
			'seo',
			{
				author: ['id', 'first_name', 'last_name', 'avatar'],
			},
		];

		if (postId && version) {
			post = (await directusServer.request(
				withToken(
					token as string,
					readItem('posts', postId, {
						version: String(version),
						fields: postFields as any,
					}),
				),
			)) as any as Post;
		} else {
			const postsData = await directusServer.request(
				withToken(
					token as string,
					readItems('posts', {
						filter: token ? { slug: { _eq: slug } } : { slug: { _eq: slug }, status: { _eq: 'published' } },
						limit: 1,
						fields: postFields as any,
					}),
				),
			);

			if (!postsData.length) {
				throw createError({ statusCode: 404, message: `Post not found: ${slug}` });
			}

			post = postsData[0] as Post;
		}

		const relatedPosts = await directusServer.request(
			readItems('posts', {
				filter: { slug: { _neq: slug }, status: { _eq: 'published' } },
				fields: ['id', 'title', 'image', 'slug'],
				limit: 2,
			}),
		);

		return { post, relatedPosts };
	} catch (error) {
		throw createError({ statusCode: 500, message: `Failed to fetch post: ${slug}`, data: error });
	}
});
