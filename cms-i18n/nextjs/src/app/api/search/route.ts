import { useDirectus } from '@/lib/directus/directus';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { addLocaleToPath } from '@/lib/i18n/utils';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const search = searchParams.get('search');

	if (!search || search.length < 3) {
		return NextResponse.json({ error: 'Query must be at least 3 characters.' }, { status: 400 });
	}

	// Get locale from header (set by middleware)
	const headersList = await headers();
	const locale = headersList.get('x-locale') || DEFAULT_LOCALE;

	const { directus, readItems } = useDirectus();

	try {
		const [pages, posts] = await Promise.all([
			directus.request(
				readItems('pages', {
					filter: {
						_or: [{ title: { _contains: search } }, { permalink: { _contains: search } }],
					},
					fields: ['id', 'title', 'permalink', 'seo'],
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
					fields: ['id', 'title', 'description', 'slug', 'content', 'status'],
				}),
			),
		]);

		const results = [
			...pages.map((page: any) => {
				const pagePath = `/${page.permalink.replace(/^\/+/, '')}`;

				return {
					id: page.id,
					title: page.title,
					description: page.seo?.meta_description,
					type: 'Page',
					link: addLocaleToPath(pagePath, locale),
				};
			}),

			...posts.map((post: any) => {
				const postPath = `/blog/${post.slug}`;

				return {
					id: post.id,
					title: post.title,
					description: post.description,
					type: 'Post',
					link: addLocaleToPath(postPath, locale),
				};
			}),
		];

		return NextResponse.json(results);
	} catch (error) {
		console.error('Error fetching search results:', error);

		return NextResponse.json({ error: 'Failed to fetch search results.' }, { status: 500 });
	}
}
