/**
 * Directus Data Fetching with i18n Support
 *
 * This module fetches content from Directus with optional translation support.
 * English (en-US) content is stored directly in collections; translations are
 * stored in {collection}_translations tables.
 *
 * Pattern:
 * 1. Fetch content with `translations` field included (when locale !== default)
 * 2. Use `deep` filter to only fetch the requested locale's translations
 * 3. Merge translations onto base objects so components use `item.title` directly
 */
import { BlockPost, Page, PageBlock, Post, Schema } from '@/types/directus-schema';
import { useDirectus } from './directus';
import { readItems, aggregate, readItem, readSingleton, withToken, QueryFilter } from '@directus/sdk';
import { Locale, DEFAULT_LOCALE } from '../i18n/config';

// Fields to skip when merging translations (metadata, not content)
const TRANSLATION_META_FIELDS = [
	'id',
	'languages_code',
	'status',
	'date_created',
	'date_updated',
	'user_created',
	'user_updated',
];

/**
 * Extracts language code from languages_code field.
 * Handles both string codes and Language objects from Directus.
 */
function getLanguageCode(languagesCode: unknown): string | null {
	if (typeof languagesCode === 'string') return languagesCode;
	if (languagesCode && typeof languagesCode === 'object' && 'code' in languagesCode) {
		return typeof (languagesCode as { code: unknown }).code === 'string'
			? (languagesCode as { code: string }).code
			: null;
	}

	return null;
}

/**
 * Builds deep filter for translations.
 * Fetches both requested locale AND default locale for fallback support.
 */
function buildTranslationsDeep(locale: Locale) {
	return {
		translations: {
			_filter: {
				_and: [
					{ status: { _eq: 'published' } },
					{
						_or: [{ languages_code: { _eq: locale } }, { languages_code: { _eq: DEFAULT_LOCALE } }],
					},
				],
			},
		},
	};
}

/**
 * Recursively merges translations into base objects.
 *
 * Directus stores default (English) content in main fields and translations
 * in a nested `translations` array. This flattens translated fields to top
 * level so components can use `page.title` instead of `page.translations[0].title`.
 */
function mergeTranslations<T>(data: T, locale: Locale): T {
	if (!data || typeof data !== 'object') return data;

	const result = { ...data } as Record<string, unknown>;

	// Merge translations array if present
	if (Array.isArray(result.translations)) {
		const translations = result.translations as Array<Record<string, unknown>>;

		// Find translation for requested locale, fallback to default
		const translation =
			translations.find((t) => getLanguageCode(t.languages_code) === locale) ||
			translations.find((t) => getLanguageCode(t.languages_code) === DEFAULT_LOCALE);

		if (translation) {
			for (const [key, value] of Object.entries(translation)) {
				// Skip metadata fields and null values
				if (!TRANSLATION_META_FIELDS.includes(key) && value != null) {
					result[key] = value;
				}
			}
		}

		delete result.translations;
	}

	// Recursively process nested objects and arrays
	for (const key of Object.keys(result)) {
		const value = result[key];
		if (Array.isArray(value)) {
			result[key] = value.map((item) => mergeTranslations(item, locale));
		} else if (value && typeof value === 'object') {
			result[key] = mergeTranslations(value, locale);
		}
	}

	return result as T;
}

/**
 * Builds field structure for page queries.
 * When includeTranslations is true, adds translations fields for i18n support.
 */
function buildPageFields(includeTranslations: boolean) {
	// Include translations field when fetching non-default locale content
	const withTranslations = includeTranslations ? ['translations.*'] : [];

	const buttonFields = [
		'id',
		'label',
		'variant',
		'url',
		'type',
		{ page: ['permalink'] },
		{ post: ['slug'] },
		...withTranslations,
	];

	const blockRichtextFields = ['id', 'tagline', 'headline', 'content', 'alignment', ...withTranslations];

	const blockGalleryFields = [
		'id',
		'tagline',
		'headline',
		...withTranslations,
		{ items: ['id', 'directus_file', 'sort'] },
	];

	const blockPricingCardsFields = [
		'id',
		'title',
		'description',
		'price',
		'badge',
		'features',
		'is_highlighted',
		...withTranslations,
		{ button: buttonFields },
	];

	const blockPricingFields = [
		'id',
		'tagline',
		'headline',
		...withTranslations,
		{ pricing_cards: blockPricingCardsFields },
	];

	const blockHeroFields = [
		'id',
		'tagline',
		'headline',
		'description',
		'layout',
		'image',
		...withTranslations,
		{ button_group: ['id', { buttons: buttonFields }] },
	];

	const blockPostsFields = ['id', 'tagline', 'headline', 'collection', 'limit', ...withTranslations];

	const formFieldsFields = [
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
		...withTranslations,
	];

	const formFields = [
		'id',
		'title',
		'submit_label',
		'success_message',
		'on_success',
		'success_redirect_url',
		'is_active',
		...withTranslations,
		{ fields: formFieldsFields },
	];

	const blockFormFields = ['id', 'tagline', 'headline', ...withTranslations, { form: formFields }];

	return [
		'id',
		'title',
		'seo',
		...withTranslations,
		{
			blocks: [
				'id',
				'background',
				'collection',
				'item',
				'sort',
				'hide_block',
				{
					item: {
						block_richtext: blockRichtextFields,
						block_gallery: blockGalleryFields,
						block_pricing: blockPricingFields,
						block_hero: blockHeroFields,
						block_posts: blockPostsFields,
						block_form: blockFormFields,
					},
				},
			],
		},
	];
}

/**
 * Fetches page data by permalink with i18n support.
 */
export async function fetchPageData(
	permalink: string,
	postPage = 1,
	token?: string,
	preview?: boolean,
	locale: Locale = DEFAULT_LOCALE,
): Promise<Page> {
	const { directus } = useDirectus();
	const includeTranslations = locale !== DEFAULT_LOCALE;

	try {
		const pageData = (await directus.request(
			withToken(
				token as string,
				readItems('pages', {
					filter:
						preview && token
							? { permalink: { _eq: permalink } }
							: { permalink: { _eq: permalink }, status: { _eq: 'published' } },
					limit: 1,
					fields: buildPageFields(includeTranslations),
					// @ts-expect-error Directus SDK doesn't recognize 'item' in deep query for polymorphic relations
					deep: {
						blocks: {
							_sort: ['sort'],
							_filter: { hide_block: { _neq: true } },
							item: {
								// Only fetch active forms (required for form_fields permission rules)
								block_form: {
									...(includeTranslations ? buildTranslationsDeep(locale) : {}),
									form: {
										_filter: { is_active: { _eq: true } },
										...(includeTranslations ? buildTranslationsDeep(locale) : {}),
										fields: includeTranslations ? buildTranslationsDeep(locale) : undefined,
									},
								},
							},
						},
						...(includeTranslations ? buildTranslationsDeep(locale) : {}),
					},
				}),
			),
		)) as Page[];

		if (!pageData.length) {
			throw new Error('Page not found');
		}

		let page = pageData[0];

		// Handle dynamic posts blocks - fetch posts separately
		if (Array.isArray(page.blocks)) {
			for (const block of page.blocks as PageBlock[]) {
				if (
					block.collection === 'block_posts' &&
					block.item &&
					typeof block.item !== 'string' &&
					'collection' in block.item &&
					block.item.collection === 'posts'
				) {
					const blockPost = block.item as BlockPost;
					const limit = blockPost.limit ?? 6;

					const postsData = await directus.request(
						readItems('posts', {
							fields: [
								'id',
								'title',
								'description',
								'slug',
								'image',
								'published_at',
								...(includeTranslations
									? [{ translations: ['title', 'description', 'languages_code', 'status'] as const }]
									: []),
							],
							filter: { status: { _eq: 'published' } },
							sort: ['-published_at'],
							limit,
							page: postPage,
							...(includeTranslations ? { deep: buildTranslationsDeep(locale) } : {}),
						}),
					);

					(block.item as BlockPost & { posts: Post[] }).posts = postsData as unknown as Post[];
				}
			}
		}

		// Merge translations if not default locale
		if (includeTranslations) {
			page = mergeTranslations(page, locale);
		}

		return page;
	} catch (error) {
		console.error('Error fetching page data:', error);
		throw new Error('Failed to fetch page data');
	}
}

/**
 * Fetches page data by ID and version (for preview/versioning).
 */
export async function fetchPageDataById(
	id: string,
	version?: string,
	token?: string,
	locale: Locale = DEFAULT_LOCALE,
): Promise<Page> {
	if (!id?.trim()) throw new Error('Invalid id: id must be a non-empty string');
	if (!version?.trim()) throw new Error('Invalid version: version must be a non-empty string');

	const { directus } = useDirectus();
	const includeTranslations = locale !== DEFAULT_LOCALE;

	try {
		return (await directus.request(
			withToken(
				token as string,
				readItem('pages', id, {
					version,
					// @ts-expect-error Directus SDK strict typing doesn't support dynamic i18n field arrays
					fields: buildPageFields(includeTranslations),
					deep: {
						blocks: {
							_sort: ['sort'],
							_filter: { hide_block: { _neq: true } },
							// @ts-expect-error Directus SDK doesn't recognize 'item' in deep query for polymorphic relations
							item: {
								// Only fetch active forms (required for form_fields permission rules)
								block_form: {
									...(includeTranslations ? buildTranslationsDeep(locale) : {}),
									form: {
										_filter: { is_active: { _eq: true } },
										...(includeTranslations ? buildTranslationsDeep(locale) : {}),
										fields: includeTranslations ? buildTranslationsDeep(locale) : undefined,
									},
								},
							},
						},
						...(includeTranslations ? buildTranslationsDeep(locale) : {}),
					},
				}),
			),
		)) as unknown as Page;
	} catch (error) {
		console.error('Error fetching versioned page:', error);
		throw new Error('Failed to fetch versioned page');
	}
}

/**
 * Gets page ID by permalink.
 */
export async function getPageIdByPermalink(permalink: string, token?: string): Promise<string | null> {
	if (!permalink?.trim()) throw new Error('Invalid permalink: permalink must be a non-empty string');

	const { directus } = useDirectus();

	try {
		const pageData = (await directus.request(
			withToken(
				token as string,
				readItems('pages', {
					filter: { permalink: { _eq: permalink } },
					limit: 1,
					fields: ['id'],
				}),
			),
		)) as Pick<Page, 'id'>[];

		return pageData.length > 0 ? pageData[0].id : null;
	} catch (error) {
		console.error('Error getting page ID:', error);

		return null;
	}
}

/**
 * Gets post ID by slug.
 */
export async function getPostIdBySlug(slug: string, token?: string): Promise<string | null> {
	if (!slug?.trim()) throw new Error('Invalid slug: slug must be a non-empty string');

	const { directus } = useDirectus();

	try {
		const postData = (await directus.request(
			withToken(
				token as string,
				readItems('posts', {
					filter: { slug: { _eq: slug } },
					limit: 1,
					fields: ['id'],
				}),
			),
		)) as Pick<Post, 'id'>[];

		return postData.length > 0 ? postData[0].id : null;
	} catch (error) {
		console.error('Error getting post ID:', error);

		return null;
	}
}

/**
 * Fetches a single blog post by slug with i18n support.
 * For non-default locales, we first try to find by main slug, then check translations if needed.
 */
export async function fetchPostBySlug(
	slug: string,
	options?: { draft?: boolean; token?: string; locale?: Locale },
): Promise<{ post: Post | null; relatedPosts: Post[] }> {
	const { directus } = useDirectus();
	const { draft, token, locale = DEFAULT_LOCALE } = options || {};
	const includeTranslations = locale !== DEFAULT_LOCALE;

	// First, try to find post by main slug (works for default locale and when slug is same across languages)
	const baseFilter: QueryFilter<Schema, Post> =
		token || draft ? { slug: { _eq: slug } } : { slug: { _eq: slug }, status: { _eq: 'published' } };

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
		{ author: ['id', 'first_name', 'last_name', 'avatar'] },
		...(includeTranslations
			? [{ translations: ['title', 'content', 'description', 'slug', 'languages_code', 'status'] as const }]
			: []),
	];

	const relatedPostFields = [
		'id',
		'title',
		'slug',
		'image',
		...(includeTranslations ? [{ translations: ['title', 'languages_code', 'status'] as const }] : []),
	];

	try {
		// Try to find post by main slug first
		let postsData = await directus.request(
			withToken(
				token as string,
				readItems('posts', {
					filter: baseFilter,
					limit: 1,
					// @ts-expect-error Directus SDK strict typing doesn't support dynamic i18n field arrays
					fields: postFields,
					...(includeTranslations ? { deep: buildTranslationsDeep(locale) } : {}),
				}),
			),
		);

		// If not found and we're looking for a non-default locale, try searching in translations
		if (postsData.length === 0 && includeTranslations) {
			// Search for posts where translation slug matches
			const translationFilter = {
				_and: [
					{ status: { _eq: 'published' } },
					{
						translations: {
							slug: { _eq: slug },
							languages_code: { _eq: locale },
							status: { _eq: 'published' },
						},
					},
				],
			};

			postsData = await directus.request(
				withToken(
					token as string,
					readItems('posts', {
						// @ts-expect-error Directus SDK doesn't support filtering by translation relations
						filter: translationFilter,
						limit: 1,
						// @ts-expect-error Directus SDK strict typing doesn't support dynamic i18n field arrays
						fields: postFields,
						deep: buildTranslationsDeep(locale),
					}),
				),
			);
		}

		const [relatedPostsData] = await Promise.all([
			directus.request(
				withToken(
					token as string,
					readItems('posts', {
						filter: { slug: { _neq: slug }, status: { _eq: 'published' } },
						limit: 2,
						// @ts-expect-error Directus SDK strict typing doesn't support dynamic i18n field arrays
						fields: relatedPostFields,
						...(includeTranslations ? { deep: buildTranslationsDeep(locale) } : {}),
					}),
				),
			),
		]);

		const post = postsData.length > 0 ? (postsData[0] as unknown as Post) : null;
		const relatedPosts = relatedPostsData as unknown as Post[];

		if (includeTranslations && post) {
			// Merge translations for the main post
			const mergedPost = mergeTranslations(post, locale);

			return {
				post: mergedPost,
				relatedPosts: relatedPosts.map((p) => mergeTranslations(p, locale)),
			};
		}

		return { post, relatedPosts };
	} catch (error) {
		console.error('Error in fetchPostBySlug:', error);
		throw new Error('Failed to fetch blog post and related posts');
	}
}

/**
 * Fetches a single blog post by ID and version (for preview/versioning).
 */
export async function fetchPostByIdAndVersion(
	id: string,
	version: string,
	slug: string,
	token?: string,
	locale: Locale = DEFAULT_LOCALE,
): Promise<{ post: Post; relatedPosts: Post[] }> {
	if (!id?.trim()) throw new Error('Invalid id: id must be a non-empty string');
	if (!version?.trim()) throw new Error('Invalid version: version must be a non-empty string');
	if (!slug?.trim()) throw new Error('Invalid slug: slug must be a non-empty string');

	const { directus } = useDirectus();
	const includeTranslations = locale !== DEFAULT_LOCALE;

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
		{ author: ['id', 'first_name', 'last_name', 'avatar'] },
		...(includeTranslations
			? [{ translations: ['title', 'content', 'description', 'slug', 'languages_code', 'status'] as const }]
			: []),
	];

	const relatedPostFields = [
		'id',
		'title',
		'slug',
		'image',
		...(includeTranslations ? [{ translations: ['title', 'languages_code', 'status'] as const }] : []),
	];

	try {
		const [postData, relatedPostsData] = await Promise.all([
			directus.request(
				withToken(
					token as string,
					readItem('posts', id, {
						version,
						// @ts-expect-error Directus SDK strict typing doesn't support dynamic i18n field arrays
						fields: postFields,
						...(includeTranslations ? { deep: buildTranslationsDeep(locale) } : {}),
					}),
				),
			),
			directus.request(
				readItems('posts', {
					filter: { slug: { _neq: slug }, status: { _eq: 'published' } },
					limit: 2,
					// @ts-expect-error Directus SDK strict typing doesn't support dynamic i18n field arrays
					fields: relatedPostFields,
					...(includeTranslations ? { deep: buildTranslationsDeep(locale) } : {}),
				}),
			),
		]);

		const post = postData as unknown as Post;
		const relatedPosts = relatedPostsData as unknown as Post[];

		if (includeTranslations) {
			return {
				post: mergeTranslations(post, locale),
				relatedPosts: relatedPosts.map((p) => mergeTranslations(p, locale)),
			};
		}

		return { post, relatedPosts };
	} catch (error) {
		console.error('Error fetching versioned post:', error);
		throw new Error('Failed to fetch versioned post');
	}
}

/**
 * Fetches paginated blog posts with i18n support.
 */
export async function fetchPaginatedPosts(
	limit: number,
	page: number,
	locale: Locale = DEFAULT_LOCALE,
): Promise<Post[]> {
	const { directus } = useDirectus();
	const includeTranslations = locale !== DEFAULT_LOCALE;

	try {
		const response = await directus.request(
			readItems('posts', {
				limit,
				page,
				sort: ['-published_at'],
				fields: [
					'id',
					'title',
					'description',
					'slug',
					'image',
					...(includeTranslations
						? [{ translations: ['title', 'description', 'languages_code', 'status'] as const }]
						: []),
				],
				filter: { status: { _eq: 'published' } },
				...(includeTranslations ? { deep: buildTranslationsDeep(locale) } : {}),
			}),
		);

		const posts = response as unknown as Post[];

		return includeTranslations ? posts.map((post) => mergeTranslations(post, locale)) : posts;
	} catch (error) {
		console.error('Error fetching paginated posts:', error);
		throw new Error('Failed to fetch paginated posts');
	}
}

/**
 * Fetches the total number of published blog posts.
 */
export async function fetchTotalPostCount(): Promise<number> {
	const { directus } = useDirectus();

	try {
		const response = await directus.request(
			aggregate('posts', {
				aggregate: { count: '*' },
				filter: { status: { _eq: 'published' } },
			}),
		);

		return Number(response[0]?.count) || 0;
	} catch (error) {
		console.error('Error fetching total post count:', error);

		return 0;
	}
}

/**
 * Fetches global site data (globals, navigation) with i18n support.
 */
export async function fetchSiteData(locale: Locale = DEFAULT_LOCALE) {
	const { directus } = useDirectus();
	const includeTranslations = locale !== DEFAULT_LOCALE;

	const globalsFields = [
		'id',
		'title',
		'description',
		'logo',
		'logo_dark_mode',
		'social_links',
		'accent_color',
		'favicon',
		...(includeTranslations ? [{ translations: ['title', 'description', 'languages_code', 'status'] as const }] : []),
	];

	const navigationItemFields = [
		'id',
		'title',
		...(includeTranslations ? [{ translations: ['title', 'languages_code', 'status'] as const }] : []),
		{ page: ['permalink'] },
		{
			children: [
				'id',
				'title',
				'url',
				...(includeTranslations ? [{ translations: ['title', 'languages_code', 'status'] as const }] : []),
				{ page: ['permalink'] },
			],
		},
	];

	const navigationFields = ['id', 'title', { items: navigationItemFields }];

	try {
		const [globalsData, headerNavigationData, footerNavigationData] = await Promise.all([
			directus.request(
				readSingleton('globals', {
					// @ts-expect-error Directus SDK strict typing doesn't support dynamic i18n field arrays
					fields: globalsFields,
					...(includeTranslations ? { deep: buildTranslationsDeep(locale) } : {}),
				}),
			),
			directus.request(
				readItem('navigation', 'main', {
					// @ts-expect-error Directus SDK strict typing doesn't support dynamic i18n field arrays
					fields: navigationFields,
					deep: {
						items: { _sort: ['sort'] },
						...(includeTranslations ? buildTranslationsDeep(locale) : {}),
					},
				}),
			),
			directus.request(
				readItem('navigation', 'footer', {
					// @ts-expect-error Directus SDK strict typing doesn't support dynamic i18n field arrays
					fields: navigationFields,
					deep: {
						items: { _sort: ['sort'] },
						...(includeTranslations ? buildTranslationsDeep(locale) : {}),
					},
				}),
			),
		]);

		if (includeTranslations) {
			return {
				globals: mergeTranslations(globalsData, locale),
				headerNavigation: mergeTranslations(headerNavigationData, locale),
				footerNavigation: mergeTranslations(footerNavigationData, locale),
			};
		}

		return {
			globals: globalsData,
			headerNavigation: headerNavigationData,
			footerNavigation: footerNavigationData,
		};
	} catch (error) {
		console.error('Error fetching site data:', error);
		throw new Error('Failed to fetch site data');
	}
}

/**
 * Fetches redirects configuration.
 */
export async function fetchRedirects(): Promise<
	Array<{ url_from: string; url_to: string; response_code: string | null }>
> {
	const { directus } = useDirectus();

	const response = await directus.request(
		readItems('redirects', {
			filter: {
				_and: [{ url_from: { _nnull: true } }, { url_to: { _nnull: true } }],
			},
			fields: ['url_from', 'url_to', 'response_code'],
		}),
	);

	return (response || []) as Array<{ url_from: string; url_to: string; response_code: string | null }>;
}
