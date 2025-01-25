import type { QueryFilter } from '@directus/sdk';
import { directusServer, readItems, aggregate } from '../utils/directus-server';

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const slug = query.slug as string | undefined;
	const excludeId = query.excludeId as string | undefined;
	const authorId = query.authorId as string | undefined;
	const limit = parseInt((query.limit as string) || '10', 10);
	const page = parseInt((query.page as string) || '1', 10);

	try {
		if (slug) {
			const post = await fetchPostBySlug(slug, { draft: query.draft === 'true' });

			if (!post) {
				throw createError({ statusCode: 404, statusMessage: `Post not found for slug: ${slug}` });
			}

			return post;
		} else if (excludeId) {
			return await fetchRelatedPosts(excludeId);
		} else if (authorId) {
			return await fetchAuthorById(authorId);
		} else if (query.total === 'true') {
			return { total: await fetchTotalPostCount() };
		} else {
			return await fetchPaginatedPosts(limit, page);
		}
	} catch (error) {
		throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', data: error });
	}
});

const fetchPostBySlug = async (slug: string, options?: { draft?: boolean }) => {
	try {
		const filter: QueryFilter<Schema, Post> = options?.draft
			? { slug: { _eq: slug } }
			: { slug: { _eq: slug }, status: { _eq: 'published' as Post['status'] } }; // Explicitly cast to the correct type

		const posts = await directusServer.request(
			readItems('posts', {
				filter,
				limit: 1,
				fields: ['id', 'title', 'content', 'status', 'image', 'description', 'author'],
			}),
		);

		return posts[0] || null;
	} catch (error) {
		console.error(`Error fetching post with slug "${slug}":`, error);
		throw new Error(`Failed to fetch post with slug "${slug}"`);
	}
};

const fetchRelatedPosts = async (excludeId: string) => {
	try {
		return await directusServer.request(
			readItems('posts', {
				filter: { status: { _eq: 'published' as Post['status'] }, id: { _neq: excludeId } }, // Explicitly cast status
				fields: ['id', 'title', 'image', 'slug'],
				limit: 2,
			}),
		);
	} catch (error) {
		console.error('Error fetching related posts:', error);
		throw new Error('Failed to fetch related posts');
	}
};

const fetchAuthorById = async (authorId: string) => {
	try {
		return await directusServer.request(
			readItems('directus_users', {
				filter: { id: { _eq: authorId } },
				fields: ['first_name', 'last_name', 'avatar'],
			}),
		);
	} catch (error) {
		console.error(`Error fetching author with ID "${authorId}":`, error);
		throw new Error(`Failed to fetch author with ID "${authorId}"`);
	}
};

const fetchPaginatedPosts = async (limit: number, page: number) => {
	try {
		return await directusServer.request(
			readItems('posts', {
				limit,
				page,
				sort: ['-published_at'],
				fields: ['id', 'title', 'description', 'slug', 'image'],
				filter: { status: { _eq: 'published' as Post['status'] } }, // Explicitly cast status
			}),
		);
	} catch (error) {
		console.error('Error fetching paginated posts:', error);
		throw new Error('Failed to fetch paginated posts');
	}
};

const fetchTotalPostCount = async (): Promise<number> => {
	try {
		const response = await directusServer.request(
			aggregate('posts', {
				aggregate: { count: '*' },
				filter: { status: { _eq: 'published' as Post['status'] } }, // Explicitly cast status
			}),
		);

		return Number(response[0]?.count) || 0;
	} catch (error) {
		console.error('Error fetching total post count:', error);
		return 0;
	}
};
