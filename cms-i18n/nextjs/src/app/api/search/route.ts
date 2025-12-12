import { useDirectus } from '@/lib/directus/directus';
import { NextResponse } from 'next/server';
import { Locale, DEFAULT_LOCALE } from '@/lib/i18n/config';
import { addLocaleToPath } from '@/lib/i18n/utils';

/**
 * Helper function to get language code from languages_code field
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

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const search = searchParams.get('search');
	const localeParam = searchParams.get('locale');
	const locale: Locale = (localeParam as Locale) || DEFAULT_LOCALE;

	if (!search || search.length < 3) {
		return NextResponse.json({ error: 'Query must be at least 3 characters.' }, { status: 400 });
	}

	const { directus, readItems } = useDirectus();

	try {
		const [pagesData, postsData] = await Promise.all([
			directus.request(
				readItems('pages', {
					filter: {
						_and: [
							{ status: { _eq: 'published' } },
							{
								_or: [{ title: { _contains: search } }, { permalink: { _contains: search } }],
							},
						],
					},
					fields: [
						'id',
						'title',
						'permalink',
						'seo',
						{
							translations: ['title', { languages_code: ['code'] }],
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

			directus.request(
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
					fields: [
						'id',
						'title',
						'description',
						'slug',
						'content',
						'status',
						{
							translations: ['title', 'description', { languages_code: ['code'] }],
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
		]);

		// Merge translations into results
		const pages = (pagesData as any[]).map((page: any) => {
			const translation =
				page.translations?.find((t: any) => {
					const code = getLanguageCode(t.languages_code);

					return code === locale;
				}) ||
				page.translations?.find((t: any) => {
					const code = getLanguageCode(t.languages_code);

					return code === DEFAULT_LOCALE;
				});

			return {
				...page,
				title: translation?.title || page.title,
			};
		});

		const posts = (postsData as any[]).map((post: any) => {
			const translation =
				post.translations?.find((t: any) => {
					const code = getLanguageCode(t.languages_code);

					return code === locale;
				}) ||
				post.translations?.find((t: any) => {
					const code = getLanguageCode(t.languages_code);

					return code === DEFAULT_LOCALE;
				});

			return {
				...post,
				title: translation?.title || post.title,
				description: translation?.description || post.description,
			};
		});

		const results = [
			...pages.map((page: any) => ({
				id: page.id,
				title: page.title,
				description: page.seo?.meta_description || '',
				type: 'Page',
				link: addLocaleToPath(`/${page.permalink.replace(/^\/+/, '')}`, locale),
			})),

			...posts.map((post: any) => ({
				id: post.id,
				title: post.title,
				description: post.description || '',
				type: 'Post',
				link: addLocaleToPath(`/blog/${post.slug}`, locale),
			})),
		];

		return NextResponse.json(results);
	} catch (error) {
		console.error('Error fetching search results:', error);

		return NextResponse.json({ error: 'Failed to fetch search results.' }, { status: 500 });
	}
}
