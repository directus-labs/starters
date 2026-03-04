import type { Post } from '#shared/types/schema';
import { DEFAULT_LOCALE } from '~/lib/i18n/config';
import { buildPostFields, buildTranslationsDeep, mergeTranslations } from '../../utils/directus-i18n';

/**
 * Posts API Handler - Fetches individual blog posts by slug
 *
 * Purpose: This handler is designed for blog post detail pages where you need to:
 * - Fetch a specific post by its slug (URL-friendly identifier)
 * - Support preview mode for draft/unpublished content
 * - Handle version-specific content (draft, published, etc.)
 * - Include related posts for content discovery
 * - Support i18n for localized content
 *
 * Key Features:
 * - Slug-based routing (e.g., /blog/my-post-title)
 * - Preview mode with token authentication
 * - Version support for content management workflows
 * - Automatic related posts fetching
 * - i18n translation support
 */
export default defineEventHandler(async (event) => {
	const slug = getRouterParam(event, 'slug');

	if (!slug) {
		throw createError({ statusCode: 400, message: 'Slug is required' });
	}

	const query = getQuery(event);
	const { preview, token: rawToken, id, version } = query;

	// Get locale from event (set by middleware or query param)
	const locale = getLocaleFromEvent(event);
	const includeTranslations = locale !== DEFAULT_LOCALE;

	// Security: Only accept tokens when preview mode is explicitly enabled
	// This prevents unauthorized access to draft content
	const token = preview === 'true' && rawToken ? String(rawToken) : null;

	// Build post fields with translation support
	const postFields = buildPostFields(includeTranslations);

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
			post = await directusServer.request<Post>(
				withToken(
					token as string,
					readItem('posts', postId, {
						version: String(version),
						// @ts-expect-error Directus SDK strict typing doesn't support dynamic i18n field arrays
						fields: postFields,
						...(includeTranslations ? { deep: buildTranslationsDeep(locale) } : {}),
					}),
				),
			);
		} else {
			// Standard request: Use readItems with slug filtering
			// Filter logic:
			// - If token exists: fetch any status (for preview mode)
			// - If no token: only fetch published content (for public viewing)
			const postsData = await directusServer.request<Post[]>(
				withToken(
					token as string,
					readItems('posts', {
						filter: token ? { slug: { _eq: slug } } : { slug: { _eq: slug }, status: { _eq: 'published' } },
						limit: 1,
						// @ts-expect-error Directus SDK strict typing doesn't support dynamic i18n field arrays
						fields: postFields,
						...(includeTranslations ? { deep: buildTranslationsDeep(locale) } : {}),
					}),
				),
			);

			if (!postsData.length || !postsData[0]) {
				throw createError({ statusCode: 404, message: `Post not found: ${slug}` });
			}

			post = postsData[0];
		}

		// Merge translations if needed
		if (includeTranslations) {
			post = mergeTranslations(post, locale);
		}

		// Content Discovery: Fetch related posts for better user engagement
		// Always fetch published posts only (no preview mode for related content)
		// Excludes the current post and limits to 2 related posts
		let relatedPosts = await directusServer.request<Post[]>(
			readItems('posts', {
				filter: { slug: { _neq: slug }, status: { _eq: 'published' } },
				fields: includeTranslations
					? ['id', 'title', 'image', 'slug', { translations: ['*'] }]
					: ['id', 'title', 'image', 'slug'],
				limit: 2,
				...(includeTranslations ? { deep: buildTranslationsDeep(locale) } : {}),
			}),
		);

		// Merge translations for related posts if needed
		if (includeTranslations) {
			relatedPosts = relatedPosts.map((p) => mergeTranslations(p, locale));
		}

		// Return both the main post and related posts for the frontend
		return { post, relatedPosts };
	} catch (error) {
		throw createError({ statusCode: 500, message: `Failed to fetch post: ${slug}`, data: error });
	}
});
