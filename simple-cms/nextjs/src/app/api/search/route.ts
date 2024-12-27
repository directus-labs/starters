import { useDirectus } from '@/lib/directus/directus';
import { NextResponse } from 'next/server';

type AllowedBlockCollections =
	| 'block_hero'
	| 'block_richtext'
	| 'block_form'
	| 'block_posts'
	| 'block_gallery'
	| 'block_pricing';

const blockCollections: AllowedBlockCollections[] = [
	'block_hero',
	'block_richtext',
	'block_form',
	'block_posts',
	'block_gallery',
	'block_pricing',
];

const collectionFields: Record<AllowedBlockCollections, string[]> = {
	block_hero: ['headline', 'tagline', 'description'],
	block_richtext: ['headline', 'tagline', 'content'],
	block_form: ['headline', 'tagline'],
	block_posts: ['headline', 'tagline'],
	block_gallery: ['headline', 'tagline'],
	block_pricing: ['headline', 'tagline'],
};

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const search = searchParams.get('search');

	if (!search || search.length < 3) {
		return NextResponse.json({ error: 'Query must be at least 3 characters.' }, { status: 400 });
	}

	const { directus, readItems } = useDirectus();

	try {
		const [pages, posts, blocks, pageBlocks] = await Promise.all([
			directus.request(
				readItems('pages', {
					filter: {
						_or: [{ title: { _contains: search } }, { description: { _contains: search } }],
					},
					fields: ['id', 'title', 'description', 'permalink'],
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
									{ content: { _contains: search } },
								],
							},
						],
					},
					fields: ['id', 'title', 'description', 'slug', 'status'],
				}),
			),

			Promise.all(
				blockCollections.map(async (collection) => {
					const filters = collectionFields[collection].map((field) => ({
						[field]: { _contains: search },
					}));

					return directus.request(
						readItems(collection, {
							filter: { _or: filters },
							fields: ['id', 'headline', 'tagline', ...(collection === 'block_richtext' ? ['content'] : [])],
						}),
					);
				}),
			),

			directus.request(
				readItems('page_blocks', {
					fields: ['id', { page: ['permalink'] }, 'item'],
				}),
			),
		]);

		const flattenedBlocks = blocks.flat();

		const results = [
			...pages.map((page: any) => ({
				id: page.id,
				title: page.title,
				description: page.description,
				type: 'Page',
				link: `/${page.permalink}`.replace(/\/+$/, '/'),
			})),

			...posts.map((post: any) => ({
				id: post.id,
				title: post.title,
				description: post.description,
				type: 'Post',
				link: `/blog/${post.slug}`,
			})),

			...flattenedBlocks.map((block: any) => {
				const pageBlock = pageBlocks.find((pb: any) => pb.item === block.id);

				if (!pageBlock || !pageBlock.page) {
					return null;
				}

				const permalink = pageBlock.page.permalink || '/';

				return {
					id: block.id,
					title: block.headline || block.tagline || 'Block',
					description: block.description || '',
					type: 'Section',
					link: `/${permalink}`.replace(/\/+$/, '/').concat(`#block-${block.id}`),
				};
			}),
		].filter((result) => result);

		return NextResponse.json(results);
	} catch (error) {
		console.error('Error fetching search results:', error);

		return NextResponse.json({ error: 'Failed to fetch search results.' }, { status: 500 });
	}
}
