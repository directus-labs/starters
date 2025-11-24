import type { Post } from '#shared/types/schema';

/**
 * Post fields configuration for Directus queries
 *
 * This defines the complete field structure for posts including:
 * - Basic post metadata (id, title, content, status, published_at)
 * - Media fields (image, description)
 * - SEO fields for search engine optimization
 * - Author information with nested user data
 */
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

/**
 * Posts API Handler - Fetches individual blog posts by slug
 *
 * Purpose: This handler is designed for blog post detail pages where you need to:
 * - Fetch a specific post by its slug (URL-friendly identifier)
 * - Support preview mode for draft/unpublished content
 * - Handle version-specific content (draft, published, etc.)
 * - Include related posts for content discovery
 *
 * Key Features:
 * - Slug-based routing (e.g., /blog/my-post-title)
 * - Preview mode with token authentication
 * - Version support for content management workflows
 * - Automatic related posts fetching
 */
export default defineEventHandler(async (event) => {
	const slug = getRouterParam(event, 'slug');

	if (!slug) {
		throw createError({ statusCode: 400, message: 'Slug is required' });
	}

	const query = getQuery(event);
	const { preview, token: rawToken, id, version } = query;

	// Security: Only accept tokens when preview mode is explicitly enabled
	// This prevents unauthorized access to draft content
	const token = preview === 'true' && rawToken ? String(rawToken) : null;

	try {
		let post: Post;
		let postId = id as string;

		// Version-specific content handling:
		// When a version is requested (e.g., "draft", "published"), we need to:
		// 1. Look up the post ID by slug if not provided directly
		// 2. Fetch the specific version of that post
		// 3. Fail gracefully if the post doesn't exist for that version
		if (version && !postId) {
			// Look up post ID by slug - this is needed because Directus version API requires an ID
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

			// Security: If version was requested but post doesn't exist, return 404
			// This prevents silent fallback to published content when version lookup fails
			if (version && !postId) {
				throw createError({ statusCode: 404, message: `Post not found for slug "${slug}" and version "${version}"` });
			}
		}

		// Execute API call based on whether we need version-specific content
		if (version && postId) {
			// Version-specific request: Use readItem with specific version
			// This is used when we have both a postId and want a specific version (draft, published, etc.)
			post = (await directusServer.request(
				withToken(
					token as string,
					readItem('posts', postId, {
						version: String(version),
						fields: postFields as any,
					}),
				),
			)) as unknown as Post;
		} else {
			// Standard request: Use readItems with slug filtering
			// Filter logic:
			// - If token exists: fetch any status (for preview mode)
			// - If no token: only fetch published content (for public viewing)
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

		// Content Discovery: Fetch related posts for better user engagement
		// Always fetch published posts only (no preview mode for related content)
		// Excludes the current post and limits to 2 related posts
		const relatedPosts = await directusServer.request(
			readItems('posts', {
				filter: { slug: { _neq: slug }, status: { _eq: 'published' } },
				fields: ['id', 'title', 'image', 'slug'],
				limit: 2,
			}),
		);

		// Return both the main post and related posts for the frontend
		return { post, relatedPosts };
	} catch (error) {
		throw createError({ statusCode: 500, message: `Failed to fetch post: ${slug}`, data: error });
	}
});
