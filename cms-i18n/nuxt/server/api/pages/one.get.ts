import { withoutTrailingSlash, withLeadingSlash } from 'ufo';
import type { Page, PageBlock, BlockPost, Post } from '#shared/types/schema';

/**
 * Page fields configuration for Directus queries
 *
 * This defines the complete field structure for pages including:
 * - Basic page metadata (title, id)
 * - SEO fields for search engine optimization
 * - Complex nested content blocks (hero, gallery, pricing, forms, etc.)
 * - All nested relationships and dynamic content fields
 */
const pageFields = [
	'title',
	'id',
	{
		// SEO fields for search engine optimization
		seo: ['title', 'meta_description', 'og_image'],
		// Content blocks
		blocks: [
			'id',
			'background',
			'collection', // Type of block (hero, gallery, pricing, etc.)
			'item', // The actual block content
			'sort',
			'hide_block',
			{
				// Different block types with their specific fields:
				item: {
					block_richtext: ['id', 'tagline', 'headline', 'content', 'alignment'],
					block_gallery: ['id', 'tagline', 'headline', { items: ['id', 'directus_file', 'sort'] }],
					block_pricing: [
						'id',
						'tagline',
						'headline',
						{
							pricing_cards: [
								'id',
								'sort',
								'title',
								'description',
								'price',
								'badge',
								'features',
								'is_highlighted',
								{
									button: ['id', 'label', 'variant', 'url', 'type', { page: ['permalink'] }, { post: ['slug'] }],
								},
							],
						},
					],
					block_hero: [
						'id',
						'tagline',
						'headline',
						'description',
						'layout',
						'image',
						{
							button_group: [
								'id',
								{
									buttons: ['id', 'label', 'variant', 'url', 'type', { page: ['permalink'] }, { post: ['slug'] }],
								},
							],
						},
					],
					block_posts: ['id', 'tagline', 'headline', 'collection', 'limit'],
					block_form: [
						'id',
						'tagline',
						'headline',
						{
							form: [
								'id',
								'title',
								'submit_label',
								'success_message',
								'on_success',
								'success_redirect_url',
								'is_active',
								{
									fields: [
										'id',
										'name',
										'type',
										'label',
										'placeholder',
										'help',
										'validation',
										'width',
										'choices',
										'required',
										'sort',
									],
								},
							],
						},
					],
				},
			},
		],
	},
];

/**
 * Pages API Handler - Fetches individual pages by permalink
 *
 * Purpose: This handler is designed for website pages (homepage, about, contact, etc.) where you need to:
 * - Fetch pages by their permalink (URL path)
 * - Support complex page layouts with multiple content blocks
 * - Handle dynamic content blocks (hero, gallery, pricing, forms, etc.)
 * - Support preview mode for draft/unpublished content
 * - Handle version-specific content for content management workflows
 *
 * Key Features:
 * - Permalink-based routing (e.g., /about, /contact, /pricing)
 * - Preview mode with token authentication
 * - Version support for content management workflows
 * - Dynamic content blocks with real-time data fetching
 * - SEO metadata support
 */
export default defineEventHandler(async (event) => {
	const query = getQuery(event);

	const { preview, token: rawToken, permalink: rawPermalink, id, version } = query;

	// Normalize permalink: ensure it starts with / and doesn't end with /
	// This handles various URL formats consistently
	const permalink = withoutTrailingSlash(withLeadingSlash(String(rawPermalink)));

	// Security: Only accept tokens when preview mode is explicitly enabled
	// This prevents unauthorized access to draft content
	const token = preview === 'true' && rawToken ? String(rawToken) : null;

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
			let lookupRequest = (readItems as any)('pages', {
				filter: { permalink: { _eq: permalink } },
				limit: 1,
				fields: ['id'],
			});

			if (token && token.trim()) {
				lookupRequest = withToken(token, lookupRequest);
			}

			const pageIdLookup = (await directusServer.request(lookupRequest)) as any[];
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
				page = (await directusServer.request(
					withToken(
						token as string,
						readItem('pages', pageId, {
							version: String(version),
							fields: pageFields as any,
							// Deep query options for complex nested data:
							// - Sort blocks by their sort order
							// - Filter out hidden blocks
							deep: {
								blocks: { _sort: ['sort'], _filter: { hide_block: { _neq: true } } },
							},
						}),
					),
				)) as unknown as Page;
			} catch (versionError) {
				// If version fetch fails, throw error
				throw createError({ statusCode: 404, statusMessage: 'Page version not found' });
			}
		} else {
			// Standard request: Use readItems with permalink filtering
			// Filter logic:
			// - If token exists: fetch any status (for preview mode)
			// - If no token: only fetch published content (for public viewing)
			const pageData = await directusServer.request(
				withToken(
					token as string,
					readItems('pages', {
						filter: token
							? { permalink: { _eq: permalink } }
							: { permalink: { _eq: permalink }, status: { _eq: 'published' } },
						limit: 1,
						fields: pageFields as any,
						// Deep query options for complex nested data:
						// - Sort blocks by their sort order
						// - Filter out hidden blocks
						deep: {
							blocks: { _sort: ['sort'], _filter: { hide_block: { _neq: true } } },
						},
					}),
				),
			);

			if (!pageData.length) {
				throw createError({ statusCode: 404, statusMessage: 'Page not found' });
			}

			page = pageData[0] as Page;
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
					const posts: Post[] = await directusServer.request(
						readItems('posts', {
							fields: ['id', 'title', 'description', 'slug', 'image', 'published_at'],
							filter: { status: { _eq: 'published' } },
							sort: ['-published_at'],
							limit,
						}),
					);

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
