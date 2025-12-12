import { BlockPost, Page, PageBlock, Post, Schema } from '@/types/directus-schema';
import { useDirectus } from './directus';
import { readItems, aggregate, readItem, readSingleton, withToken, QueryFilter } from '@directus/sdk';
import { RedirectError } from '../redirects';
import { Locale, DEFAULT_LOCALE } from '../i18n/config';

/**
 * Build page fields with translations support
 */
const buildPageFields = (locale: Locale = DEFAULT_LOCALE) => {
	return [
		'title',
		'seo',
		'id',
		{
			translations: ['title', 'languages_code'],
		},
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
						block_richtext: [
							'id',
							'tagline',
							'headline',
							'content',
							'alignment',
							{
								translations: ['tagline', 'headline', 'content', 'languages_code'],
							},
						],
						block_gallery: [
							'id',
							'tagline',
							'headline',
							{
								items: ['id', 'directus_file', 'sort'],
								translations: ['tagline', 'headline', 'languages_code'],
							},
						],
						block_pricing: [
							'id',
							'tagline',
							'headline',
							{
								translations: ['tagline', 'headline', 'languages_code'],
								pricing_cards: [
									'id',
									'title',
									'description',
									'price',
									'badge',
									'features',
									'is_highlighted',
									{
										translations: ['title', 'description', 'badge', 'languages_code'],
										button: [
											'id',
											'label',
											'variant',
											'url',
											'type',
											{ page: ['permalink'] },
											{ post: ['slug'] },
											{
												translations: ['label', 'languages_code'],
											},
										],
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
								translations: ['tagline', 'headline', 'description', 'languages_code'],
								button_group: [
									'id',
									{
										buttons: [
											'id',
											'label',
											'variant',
											'url',
											'type',
											{ page: ['permalink'] },
											{ post: ['slug'] },
											{
												translations: ['label', 'languages_code'],
											},
										],
									},
								],
							},
						],
						block_posts: [
							'id',
							'tagline',
							'headline',
							'collection',
							'limit',
							{
								translations: ['tagline', 'headline', 'languages_code'],
							},
						],
						block_form: [
							'id',
							'tagline',
							'headline',
							{
								translations: ['tagline', 'headline', 'languages_code'],
								form: [
									'id',
									'title',
									'submit_label',
									'success_message',
									'on_success',
									'success_redirect_url',
									'is_active',
									{
										translations: ['title', 'submit_label', 'success_message', 'languages_code'],
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
											{
												translations: ['label', 'placeholder', 'help', 'languages_code'],
											},
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
};

/**
 * Helper function to get language code from languages_code field
 * languages_code can be either a string (code) or a Language object with a code property
 */
function getLanguageCode(languagesCode: unknown): string | null {
	if (typeof languagesCode === 'string') {
		return languagesCode;
	}
	if (languagesCode && typeof languagesCode === 'object' && 'code' in languagesCode) {
		return typeof languagesCode.code === 'string' ? languagesCode.code : null;
	}

	return null;
}

/**
 * Helper function to merge translations into an object
 */
function mergeTranslations<T extends Record<string, unknown>>(
	item: T,
	locale: Locale,
	defaultLocale: Locale = DEFAULT_LOCALE,
): T {
	if (!item || typeof item !== 'object') {
		return item;
	}

	const result = { ...item };

	// Handle translations array
	if (Array.isArray((item as { translations?: unknown[] }).translations)) {
		const translations = (
			item as { translations?: Array<{ languages_code?: unknown; status?: unknown; [key: string]: unknown }> }
		).translations;
		if (translations && translations.length > 0) {
			// Filter to only published translations
			const publishedTranslations = translations.filter((t) => {
				return t.status === 'published';
			});

			// Find translation for the requested locale, fallback to default
			const translation =
				publishedTranslations.find((t) => {
					const code = getLanguageCode(t.languages_code);

					return code === locale;
				}) ||
				publishedTranslations.find((t) => {
					const code = getLanguageCode(t.languages_code);

					return code === DEFAULT_LOCALE;
				});

			if (translation) {
				// Merge translation fields into the main object
				Object.keys(translation).forEach((key) => {
					if (
						key !== 'languages_code' &&
						key !== 'id' &&
						key !== 'post' &&
						key !== 'date_created' &&
						key !== 'date_updated' &&
						key !== 'user_created' &&
						key !== 'user_updated' &&
						key !== 'status' &&
						translation[key] !== null &&
						translation[key] !== undefined
					) {
						(result as Record<string, unknown>)[key] = translation[key];
					}
				});
			}
		}
		// Remove translations from result as they're now merged
		delete (result as { translations?: unknown[] }).translations;
	}

	// Recursively process nested objects and arrays
	Object.keys(result).forEach((key) => {
		const resultRecord = result as Record<string, unknown>;
		if (Array.isArray(resultRecord[key])) {
			resultRecord[key] = (resultRecord[key] as unknown[]).map((item) =>
				typeof item === 'object' && item !== null ? mergeTranslations(item as T, locale, DEFAULT_LOCALE) : item,
			);
		} else if (resultRecord[key] && typeof resultRecord[key] === 'object' && resultRecord[key] !== null) {
			resultRecord[key] = mergeTranslations(resultRecord[key] as T, locale, DEFAULT_LOCALE);
		}
	});

	return result;
}

/**
 * Fetch translations for a block item separately
 */
async function fetchBlockTranslations(
	blockCollection: string,
	blockId: string,
	locale: Locale,
): Promise<Array<{ languages_code: string; [key: string]: unknown }> | null> {
	const { directus } = useDirectus();
	const translationCollection = `${blockCollection}_translations` as string;

	try {
		const translations = await directus.request(
			readItems(translationCollection as any, {
				filter: {
					_and: [
						{ [blockCollection]: { _eq: blockId } },
						{ status: { _eq: 'published' } },
						{
							_or: [{ languages_code: { _eq: locale } }, { languages_code: { _eq: DEFAULT_LOCALE } }],
						},
					],
				},
				fields: ['*'],
				limit: 10,
			}),
		);

		return translations as Array<{ languages_code: string; [key: string]: unknown }>;
	} catch (error) {
		console.error(`Error fetching translations for ${blockCollection}:`, error);

		return null;
	}
}

/**
 * Fetches page data by permalink, including all nested blocks and dynamically fetching blog posts if required.
 */
export const fetchPageData = async (
	permalink: string,
	postPage = 1,
	token?: string,
	preview?: boolean,
	locale: Locale = DEFAULT_LOCALE,
) => {
	const { directus } = useDirectus();

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
					fields: buildPageFields(locale) as any,
					deep: {
						blocks: {
							_sort: ['sort'],
							_filter: { hide_block: { _neq: true } },
							item: {
								block_form: {
									form: {
										fields: {
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
										},
									},
								},
							},
						},
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
					} as any,
				}),
			),
		)) as Page[];

		if (!pageData.length) {
			throw new Error('Page not found');
		}

		let page = pageData[0];

		// Merge translations into the page object
		page = mergeTranslations(page as unknown as Record<string, unknown>, locale) as unknown as Page;

		// Fetch translations separately for blocks if they weren't included in the M2A query
		if (Array.isArray(page.blocks)) {
			const translationPromises: Promise<void>[] = [];

			for (const block of page.blocks as PageBlock[]) {
				if (block.item && typeof block.item === 'object' && 'id' in block.item && !('translations' in block.item)) {
					const blockId = block.item.id;
					const blockCollection = block.collection;

					if (blockId && typeof blockId === 'string' && blockCollection) {
						// Fetch translations for this block
						translationPromises.push(
							fetchBlockTranslations(blockCollection, blockId, locale).then((translations) => {
								if (translations && translations.length > 0 && block.item) {
									// Add translations to the block item
									(block.item as { translations?: unknown[] }).translations = translations;
									// Merge translations into the block item (this will also handle nested items)
									block.item = mergeTranslations(
										block.item as unknown as Record<string, unknown>,
										locale,
									) as unknown as typeof block.item;
								}

								return undefined;
							}),
						);
					}
				}

				// Also fetch translations for nested items that might need them
				// (e.g., button_group, pricing_cards, form fields)
				if (block.item && typeof block.item === 'object') {
					const item = block.item as unknown as Record<string, unknown>;

					// Handle button_group - fetch translations for individual buttons
					// Note: block_button_group doesn't have translations, but block_button does
					if (item.button_group && typeof item.button_group === 'object' && 'buttons' in item.button_group) {
						const buttons = (item.button_group as { buttons?: unknown[] }).buttons;
						if (Array.isArray(buttons)) {
							for (const button of buttons) {
								if (button && typeof button === 'object' && 'id' in button) {
									const buttonId = button.id;
									if (buttonId && typeof buttonId === 'string') {
										translationPromises.push(
											fetchBlockTranslations('block_button', buttonId, locale).then((translations) => {
												if (translations && translations.length > 0) {
													(button as { translations?: unknown[] }).translations = translations;
													Object.assign(
														button,
														mergeTranslations(button as unknown as Record<string, unknown>, locale),
													);
												}

												return undefined;
											}),
										);
									}
								}
							}
						}
					}

					// Handle pricing_cards translations
					if (Array.isArray(item.pricing_cards)) {
						for (const card of item.pricing_cards) {
							if (card && typeof card === 'object' && 'id' in card) {
								const cardId = card.id;
								if (cardId && typeof cardId === 'string') {
									translationPromises.push(
										fetchBlockTranslations('block_pricing_cards', cardId, locale).then((translations) => {
											if (translations && translations.length > 0) {
												(card as { translations?: unknown[] }).translations = translations;
												Object.assign(card, mergeTranslations(card as unknown as Record<string, unknown>, locale));
											}

											return undefined;
										}),
									);
								}
							}
						}
					}

					// Handle form fields translations
					if (item.form && typeof item.form === 'object' && 'fields' in item.form) {
						const form = item.form as { fields?: unknown[] };
						if (Array.isArray(form.fields)) {
							for (const field of form.fields) {
								if (field && typeof field === 'object' && 'id' in field) {
									const fieldId = field.id;
									if (fieldId && typeof fieldId === 'string') {
										// Check if field already has translations, if not fetch them
										const fieldObj = field as { translations?: unknown[] };
										if (
											!fieldObj.translations ||
											(Array.isArray(fieldObj.translations) && fieldObj.translations.length === 0)
										) {
											translationPromises.push(
												fetchBlockTranslations('forms_fields', fieldId, locale).then((translations) => {
													if (translations && translations.length > 0) {
														fieldObj.translations = translations;
														Object.assign(
															field,
															mergeTranslations(field as unknown as Record<string, unknown>, locale),
														);
													}

													return undefined;
												}),
											);
										} else {
											// Field already has translations, just merge them
											Object.assign(field, mergeTranslations(field as unknown as Record<string, unknown>, locale));
										}
									}
								}
							}
						}
					}
				}
			}

			// Wait for all translation fetches to complete
			await Promise.all(translationPromises);
		}

		// Dynamic Content Enhancement:
		// Some blocks need additional data fetched at runtime
		// This is where we enhance static block data with dynamic content
		if (Array.isArray(page.blocks)) {
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
					const postsData = await directus.request(
						readItems('posts', {
							fields: [
								'id',
								'title',
								'description',
								'slug',
								'image',
								'published_at',
								{
									translations: ['title', 'description', 'languages_code'],
								},
							],
							filter: { status: { _eq: 'published' } },
							sort: ['-published_at'],
							limit,
							page: postPage,
							deep: {
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
							},
						}),
					);
					const posts: Post[] = (postsData as Post[]).map(
						(post) => mergeTranslations(post as unknown as Record<string, unknown>, locale) as unknown as Post,
					);

					// Attach the fetched posts to the block for frontend rendering
					(block.item as BlockPost & { posts: Post[] }).posts = posts;
				}
			}
		}

		return page;
	} catch (error) {
		console.error('Error fetching page data:', error);
		throw new Error('Failed to fetch page data');
	}
};

/**
 * Fetches page data by id and version
 */
export const fetchPageDataById = async (
	id: string,
	version?: string,
	token?: string,
	locale: Locale = DEFAULT_LOCALE,
): Promise<Page> => {
	if (!id || id.trim() === '') {
		throw new Error('Invalid id: id must be a non-empty string');
	}
	if (!version || version.trim() === '') {
		throw new Error('Invalid version: version must be a non-empty string');
	}

	const { directus } = useDirectus();

	try {
		const page = (await directus.request(
			withToken(
				token as string,
				readItem('pages', id, {
					version,
					fields: buildPageFields(locale) as any,
					deep: {
						blocks: { _sort: ['sort'], _filter: { hide_block: { _neq: true } } },
					} as any,
				}),
			),
		)) as unknown as Page;

		return mergeTranslations(page as unknown as Record<string, unknown>, locale) as unknown as Page;
	} catch (error) {
		console.error('Error fetching versioned page:', error);
		throw new Error('Failed to fetch versioned page');
	}
};

/**
 * Helper function to get page ID by permalink
 */
export const getPageIdByPermalink = async (permalink: string, token?: string) => {
	if (!permalink || permalink.trim() === '') {
		throw new Error('Invalid permalink: permalink must be a non-empty string');
	}

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
};

/**
 * Helper function to get post ID by slug
 */
export const getPostIdBySlug = async (slug: string, token?: string) => {
	if (!slug || slug.trim() === '') {
		throw new Error('Invalid slug: slug must be a non-empty string');
	}

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
};

/**
 * Fetches a single blog post by ID and version
 */
export const fetchPostByIdAndVersion = async (
	id: string,
	version: string,
	slug: string,
	token?: string,
	locale: Locale = DEFAULT_LOCALE,
): Promise<{ post: Post; relatedPosts: Post[] }> => {
	if (!id || id.trim() === '') {
		throw new Error('Invalid id: id must be a non-empty string');
	}
	if (!version || version.trim() === '') {
		throw new Error('Invalid version: version must be a non-empty string');
	}
	if (!slug || slug.trim() === '') {
		throw new Error('Invalid slug: slug must be a non-empty string');
	}

	const { directus } = useDirectus();

	try {
		const [postData, relatedPostsData] = await Promise.all([
			directus.request(
				withToken(
					token as string,
					readItem('posts', id, {
						version,
						fields: [
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
							{
								translations: ['title', 'content', 'description', 'slug', 'languages_code'],
							},
						],
						deep: {
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
						},
					}),
				),
			),
			directus.request(
				readItems('posts', {
					filter: { slug: { _neq: slug }, status: { _eq: 'published' } },
					limit: 2,
					fields: [
						'id',
						'title',
						'slug',
						'image',
						{
							translations: ['title', 'languages_code'],
						},
					],
					deep: {
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
					} as any,
				}),
			),
		]);

		const post = mergeTranslations(postData as unknown as Record<string, unknown>, locale) as unknown as Post;
		const relatedPosts = (relatedPostsData as Post[]).map(
			(p) => mergeTranslations(p as unknown as Record<string, unknown>, locale) as unknown as Post,
		);

		return { post, relatedPosts };
	} catch (error) {
		console.error('Error fetching versioned post:', error);
		throw new Error('Failed to fetch versioned post');
	}
};

/**
 * Fetches global site data, header navigation, and footer navigation.
 */
export const fetchSiteData = async (locale: Locale = DEFAULT_LOCALE) => {
	const { directus } = useDirectus();

	try {
		// Try to fetch globals with translations, but fallback if translations field isn't accessible
		let globalsData: any;
		try {
			globalsData = (await directus.request(
				readSingleton('globals', {
					fields: [
						'id',
						'title',
						'description',
						'logo',
						'logo_dark_mode',
						'social_links',
						'accent_color',
						'favicon',
						{
							translations: ['title', 'description', 'languages_code'],
						} as any,
					] as any,
					deep: {
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
					} as any,
				}),
			)) as any;
		} catch (error) {
			// If translations field isn't accessible, fetch without it and try to get translations separately
			console.warn('Could not fetch globals with translations, fetching without:', error);
			globalsData = (await directus.request(
				readSingleton('globals', {
					fields: [
						'id',
						'title',
						'description',
						'logo',
						'logo_dark_mode',
						'social_links',
						'accent_color',
						'favicon',
					] as any,
				}),
			)) as any;

			// Try to fetch translations separately
			try {
				const translations = await directus.request(
					readItems('globals_translations', {
						filter: {
							_and: [
								{ globals: { _eq: globalsData.id } },
								{ status: { _eq: 'published' } },
								{
									_or: [{ languages_code: { _eq: locale } }, { languages_code: { _eq: DEFAULT_LOCALE } }],
								},
							],
						},
						fields: ['*'],
						limit: 10,
					}),
				);
				if (translations && Array.isArray(translations) && translations.length > 0) {
					(globalsData as { translations?: unknown[] }).translations = translations;
				}
			} catch (translationError) {
				console.warn('Could not fetch globals translations separately:', translationError);
			}
		}

		const [headerNavigationData, footerNavigationData] = await Promise.all([
			directus.request(
				readItem('navigation', 'main', {
					fields: [
						'id',
						'title',
						{
							items: [
								'id',
								'title',
								{
									page: ['permalink'],
									children: [
										'id',
										'title',
										'url',
										{ page: ['permalink'] },
										{
											translations: ['title', 'languages_code'],
										} as any,
									],
									translations: ['title', 'languages_code'] as any,
								},
							],
						} as any,
					] as any,
					deep: {
						items: {
							_sort: ['sort'],
							translations: {
								_filter: {
									_or: [{ languages_code: { _eq: locale } }, { languages_code: { _eq: DEFAULT_LOCALE } }],
								},
							},
						} as any,
					} as any,
				}),
			),
			directus.request(
				readItem('navigation', 'footer', {
					fields: [
						'id',
						'title',
						{
							items: [
								'id',
								'title',
								{
									page: ['permalink'],
									children: [
										'id',
										'title',
										'url',
										{ page: ['permalink'] },
										{
											translations: ['title', 'languages_code'],
										} as any,
									],
									translations: ['title', 'languages_code'] as any,
								} as any,
							] as any,
						} as any,
					] as any,
					deep: {
						items: {
							translations: {
								_filter: {
									_or: [{ languages_code: { _eq: locale } }, { languages_code: { _eq: DEFAULT_LOCALE } }],
								},
							},
						} as any,
					} as any,
				}),
			),
		]);

		const globals = mergeTranslations(globalsData as Record<string, unknown>, locale, DEFAULT_LOCALE);
		const headerNavigation = mergeTranslations(headerNavigationData as Record<string, unknown>, locale, DEFAULT_LOCALE);
		const footerNavigation = mergeTranslations(footerNavigationData as Record<string, unknown>, locale, DEFAULT_LOCALE);

		return { globals, headerNavigation, footerNavigation };
	} catch (error) {
		console.error('Error fetching site data:', error);
		throw new Error('Failed to fetch site data');
	}
};

/**
 * Fetches a single blog post by slug and related blog posts excluding the given ID. Handles live preview mode.
 */
export const fetchPostBySlug = async (
	slug: string,
	options?: { draft?: boolean; token?: string; locale?: Locale },
): Promise<{ post: Post | null; relatedPosts: Post[] }> => {
	const { directus } = useDirectus();
	const { draft, token, locale = DEFAULT_LOCALE } = options || {};

	try {
		const filter: QueryFilter<Schema, Post> =
			token || draft ? { slug: { _eq: slug } } : { slug: { _eq: slug }, status: { _eq: 'published' } };

		const [postsData, relatedPostsData] = await Promise.all([
			directus.request<Post[]>(
				withToken(
					token as string,
					readItems<Schema, 'posts', any>('posts', {
						filter,
						limit: 1,
						fields: [
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
							{
								translations: ['title', 'content', 'description', 'slug', 'languages_code'],
							},
						],
						deep: {
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
						},
					}),
				),
			),
			directus.request<Post[]>(
				withToken(
					token as string,
					readItems<Schema, 'posts', any>('posts', {
						filter: { slug: { _neq: slug }, status: { _eq: 'published' } },
						limit: 2,
						fields: [
							'id',
							'title',
							'slug',
							'image',
							{
								translations: ['title', 'languages_code'],
							},
						],
						deep: {
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
						},
					}),
				),
			),
		]);

		const post: Post | null =
			postsData.length > 0
				? (mergeTranslations(postsData[0] as unknown as Record<string, unknown>, locale) as unknown as Post)
				: null;
		const relatedPosts: Post[] = (relatedPostsData as Post[]).map(
			(p) => mergeTranslations(p as unknown as Record<string, unknown>, locale) as unknown as Post,
		);

		return { post, relatedPosts };
	} catch (error) {
		console.error('Error in fetchPostBySlug:', error);
		throw new Error('Failed to fetch blog post and related posts');
	}
};

/**
 * Fetches paginated blog posts.
 */
export const fetchPaginatedPosts = async (
	limit: number,
	page: number,
	locale: Locale = DEFAULT_LOCALE,
): Promise<Post[]> => {
	const { directus } = useDirectus();
	try {
		const responseData = await directus.request(
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
					{
						translations: ['title', 'description', 'languages_code'],
					},
				],
				filter: { status: { _eq: 'published' } },
				deep: {
					translations: {
						_filter: {
							_or: [{ languages_code: { _eq: locale } }, { languages_code: { _eq: DEFAULT_LOCALE } }],
						},
					},
				},
			}),
		);

		return (responseData as Post[]).map(
			(post) => mergeTranslations(post as unknown as Record<string, unknown>, locale) as unknown as Post,
		);
	} catch (error) {
		console.error('Error fetching paginated posts:', error);
		throw new Error('Failed to fetch paginated posts');
	}
};

/**
 * Fetches the total number of published blog posts.
 */
export const fetchTotalPostCount = async (): Promise<number> => {
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
};

export async function fetchRedirects(): Promise<Array<{ url_from: string; url_to: string; response_code: number }>> {
	const { directus } = useDirectus();
	const response = await directus.request(
		readItems('redirects' as any, {
			filter: {
				_and: [
					{
						url_from: { _nnull: true },
					},
					{
						url_to: { _nnull: true },
					},
				],
			},
			fields: ['url_from', 'url_to', 'response_code'],
		}),
	);

	return (response || []) as Array<{ url_from: string; url_to: string; response_code: number }>;
}
