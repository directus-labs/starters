import { withoutTrailingSlash, withLeadingSlash } from 'ufo';
import type { Page, PageBlock, BlockPost, Post } from '#shared/types/schema';
import { DEFAULT_LOCALE } from '~/lib/i18n/config';
import { buildPageFields, buildTranslationsDeep, mergeTranslations } from '../../utils/directus-i18n';

/**
 * Pages API Handler - Fetches individual pages by permalink
 *
 * Purpose: This handler is designed for website pages (homepage, about, contact, etc.) where you need to:
 * - Fetch pages by their permalink (URL path)
 * - Support complex page layouts with multiple content blocks
 * - Handle dynamic content blocks (hero, gallery, pricing, forms, etc.)
 * - Support preview mode for draft/unpublished content
 * - Handle version-specific content for content management workflows
 * - Support i18n for localized content
 *
 * Key Features:
 * - Permalink-based routing (e.g., /about, /contact, /pricing)
 * - Preview mode with token authentication
 * - Version support for content management workflows
 * - Dynamic content blocks with real-time data fetching
 * - SEO metadata support
 * - i18n translation support
 */
export default defineEventHandler(async (event) => {
	const query = getQuery(event);

	const { preview, token: rawToken, permalink: rawPermalink, id, version } = query;

	// Get locale from event (set by middleware or query param)
	const locale = getLocaleFromEvent(event);
	const includeTranslations = locale !== DEFAULT_LOCALE;

	// Normalize permalink: ensure it starts with / and doesn't end with /
	// This handles various URL formats consistently
	const permalink = withoutTrailingSlash(withLeadingSlash(String(rawPermalink)));

	// Security: Only accept tokens when preview mode is explicitly enabled
	// This prevents unauthorized access to draft content
	const token = preview === 'true' && rawToken ? String(rawToken) : null;

	// Build page fields with translation support
	const pageFields = buildPageFields(includeTranslations);

	// Build deep query with translations
	const buildDeepQuery = () => {
		const baseDeep: Record<string, unknown> = {
			blocks: {
				_sort: ['sort'],
				_filter: { hide_block: { _neq: true } },
				...(includeTranslations
					? {
							item: {
								block_form: {
									...buildTranslationsDeep(locale),
									form: {
										_filter: { is_active: { _eq: true } },
										...buildTranslationsDeep(locale),
										fields: buildTranslationsDeep(locale),
									},
								},
								block_hero: {
									...buildTranslationsDeep(locale),
									button_group: {
										buttons: buildTranslationsDeep(locale),
									},
								},
								block_pricing: {
									...buildTranslationsDeep(locale),
									pricing_cards: {
										...buildTranslationsDeep(locale),
										button: buildTranslationsDeep(locale),
									},
								},
								block_richtext: buildTranslationsDeep(locale),
								block_gallery: buildTranslationsDeep(locale),
								block_posts: buildTranslationsDeep(locale),
							},
						}
					: {}),
			},
		};

		if (includeTranslations) {
			return { ...baseDeep, ...buildTranslationsDeep(locale) };
		}

		return baseDeep;
	};

	try {
		let page: Page;
		let pageId = id as string;

		// Version-specific content handling:
		// When a version is requested (e.g., "draft", "published"), we need to:
		// 1. Look up the page ID by permalink if not provided directly
		// 2. Fetch the specific version of that page
		// 3. Fail gracefully if the page doesn't exist for that version
		if (version && !pageId) {
			// Look up page ID by permalink - this is needed because Directus version API requires an ID
			const pageIdLookup = await directusServer.request(
				token && token.trim()
					? withToken(
							token,
							readItems('pages', { filter: { permalink: { _eq: permalink } }, limit: 1, fields: ['id'] }),
						)
					: readItems('pages', { filter: { permalink: { _eq: permalink } }, limit: 1, fields: ['id'] }),
			);
			pageId = pageIdLookup.length > 0 ? pageIdLookup[0]?.id || '' : '';

			// Security: If version was requested but page doesn't exist, return 404
			// This prevents silent fallback to published content when version lookup fails
			if (version && !pageId) {
				throw createError({ statusCode: 404, statusMessage: 'Page version not found' });
			}
		}

		// Execute API call based on whether we need version-specific content
		if (version && pageId) {
			// Version-specific request: Use readItem with specific version
			// This is used when we have both a pageId and want a specific version (draft, published, etc.)
			try {
				page = await directusServer.request<Page>(
					withToken(
						token as string,
						readItem('pages', pageId, {
							version: String(version),
							// @ts-expect-error Directus SDK strict typing doesn't support dynamic i18n field arrays
							fields: pageFields,
							deep: buildDeepQuery(),
						}),
					),
				);
			} catch {
				// If version fetch fails, throw error
				throw createError({ statusCode: 404, statusMessage: 'Page version not found' });
			}
		} else {
			// Standard request: Use readItems with permalink filtering
			// Filter logic:
			// - If token exists: fetch any status (for preview mode)
			// - If no token: only fetch published content (for public viewing)
			const pageData = await directusServer.request<Page[]>(
				withToken(
					token as string,
					readItems('pages', {
						filter: token
							? { permalink: { _eq: permalink } }
							: { permalink: { _eq: permalink }, status: { _eq: 'published' } },
						limit: 1,
						// @ts-expect-error Directus SDK strict typing doesn't support dynamic i18n field arrays
						fields: pageFields,
						deep: buildDeepQuery(),
					}),
				),
			);

			if (!pageData.length || !pageData[0]) {
				throw createError({ statusCode: 404, statusMessage: 'Page not found' });
			}

			page = pageData[0];
		}

		// Merge translations if needed
		if (includeTranslations) {
			page = mergeTranslations(page, locale);
		}

		// Dynamic Content Enhancement:
		// Some blocks need additional data fetched at runtime
		// This is where we enhance static block data with dynamic content
		if (Array.isArray(page?.blocks)) {
			for (const block of page.blocks as PageBlock[]) {
				// Handle dynamic posts blocks - these blocks display a list of posts
				// The posts are fetched dynamically based on the block's configuration
				if (
					block.collection === 'block_posts' &&
					block.item &&
					typeof block.item !== 'string' &&
					'collection' in block.item &&
					block.item.collection === 'posts'
				) {
					const blockPost = block.item as BlockPost;
					const limit = blockPost.limit ?? 6; // Default to 6 posts if no limit specified

					// Fetch the actual posts data for this block
					// Always fetch published posts only (no preview mode for dynamic content)
					let posts = await directusServer.request<Post[]>(
						readItems('posts', {
							fields: includeTranslations
								? ['id', 'title', 'description', 'slug', 'image', 'published_at', { translations: ['*'] }]
								: ['id', 'title', 'description', 'slug', 'image', 'published_at'],
							filter: { status: { _eq: 'published' } },
							sort: ['-published_at'],
							limit,
							...(includeTranslations ? { deep: buildTranslationsDeep(locale) } : {}),
						}),
					);

					// Merge translations for posts if needed
					if (includeTranslations) {
						posts = posts.map((post) => mergeTranslations(post, locale));
					}

					// Attach the fetched posts to the block for frontend rendering
					(block.item as BlockPost & { posts: Post[] }).posts = posts;
				}
			}
		}

		return page;
	} catch {
		throw createError({ statusCode: 500, statusMessage: 'Page not found' });
	}
});
