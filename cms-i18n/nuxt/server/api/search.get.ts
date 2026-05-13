import type { Page, Post, PagesTranslation, PostsTranslation } from '#shared/types/schema';
import { DEFAULT_LOCALE } from '~/lib/i18n/config';
import { getLanguageCode } from '../utils/directus-i18n';

// Define field arrays as const for better type inference
const PAGE_FIELDS = ['id', 'title', 'permalink', 'seo'] as const;
const PAGE_FIELDS_WITH_TRANSLATIONS = [
	...PAGE_FIELDS,
	{ translations: ['title', { languages_code: ['code'] }] },
] as const;

const POST_FIELDS = ['id', 'title', 'description', 'slug', 'content', 'status'] as const;
const POST_FIELDS_WITH_TRANSLATIONS = [
	...POST_FIELDS,
	{ translations: ['title', 'description', { languages_code: ['code'] }] },
] as const;

export default defineCachedEventHandler(
	async (event) => {
		const query = getQuery(event);
		const search = query.search as string;

		// Get locale from event (set by middleware or query param)
		const locale = getLocaleFromEvent(event);
		const includeTranslations = locale !== DEFAULT_LOCALE;

		if (!search || search.length < 3) {
			throw createError({ statusCode: 400, message: 'Query must be at least 3 characters.' });
		}

		try {
			const translationsDeep = {
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

			const [pagesData, postsData] = await Promise.all([
				directusServer.request<Page[]>(
					readItems('pages', {
						filter: {
							_and: [
								{ status: { _eq: 'published' } },
								{
									_or: [{ title: { _contains: search } }, { permalink: { _contains: search } }],
								},
							],
						},
						fields: includeTranslations ? PAGE_FIELDS_WITH_TRANSLATIONS : PAGE_FIELDS,
						...(includeTranslations ? { deep: translationsDeep } : {}),
					}),
				),

				directusServer.request<Post[]>(
					readItems('posts', {
						filter: {
							_and: [
								{ status: { _eq: 'published' } },
								{
									_or: [
										{ title: { _contains: search } },
										{ description: { _contains: search } },
										{ slug: { _contains: search } },
										{ content: { _contains: search } },
									],
								},
							],
						},
						fields: includeTranslations ? POST_FIELDS_WITH_TRANSLATIONS : POST_FIELDS,
						...(includeTranslations ? { deep: translationsDeep } : {}),
					}),
				),
			]);

			// Merge translations into results
			const pages = pagesData.map((page) => {
				if (includeTranslations && 'translations' in page && Array.isArray(page.translations)) {
					const translations = page.translations as PagesTranslation[];
					const translation =
						translations.find((t) => {
							const code = getLanguageCode(t.languages_code);
							return code === locale;
						}) ||
						translations.find((t) => {
							const code = getLanguageCode(t.languages_code);
							return code === DEFAULT_LOCALE;
						});

					return {
						...page,
						title: translation?.title || page.title,
					};
				}

				return page;
			});

			const posts = postsData.map((post) => {
				if (includeTranslations && 'translations' in post && Array.isArray(post.translations)) {
					const translations = post.translations as PostsTranslation[];
					const translation =
						translations.find((t) => {
							const code = getLanguageCode(t.languages_code);
							return code === locale;
						}) ||
						translations.find((t) => {
							const code = getLanguageCode(t.languages_code);
							return code === DEFAULT_LOCALE;
						});

					return {
						...post,
						title: translation?.title || post.title,
						description: translation?.description || post.description,
					};
				}

				return post;
			});

			const results = [
				...pages.map((page) => ({
					id: page.id,
					title: page.title,
					type: 'Page',
					link: `/${page.permalink?.replace(/^\/+/, '') || ''}`,
					content: '',
				})),

				...posts.map((post) => ({
					id: post.id,
					title: post.title,
					description: post.description,
					type: 'Post',
					link: `/blog/${post.slug}`,
					content: post.content,
				})),
			];

			return results;
		} catch {
			throw createError({ statusCode: 500, message: 'Failed to fetch search results.' });
		}
	},
	{
		maxAge: 60, // 1 minute
		getKey: (event) => {
			const query = getQuery(event);
			const locale = getLocaleFromEvent(event);
			return `search-${query.search}-${locale}`;
		},
	},
);
