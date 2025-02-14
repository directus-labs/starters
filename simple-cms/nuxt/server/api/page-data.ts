import { directusServer, readItems } from '../utils/directus-server';

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const permalink = query.permalink as string;

	try {
		const pageData = await directusServer.request(
			readItems('pages', {
				filter: { permalink: { _eq: permalink } },
				limit: 1,
				fields: [
					'title',
					{
						seo: ['title', 'meta_description', 'og_image'],
						blocks: [
							'id',
							'background',
							'collection',
							'item',
							'sort',
							'hide_block',
							{
								item: {
									block_richtext: ['tagline', 'headline', 'content', 'alignment'],
									block_gallery: ['id', 'tagline', 'headline', { items: ['id', 'directus_file', 'sort'] }],
									block_pricing: [
										'tagline',
										'headline',
										{
											pricing_cards: [
												'id',
												'title',
												'description',
												'price',
												'badge',
												'features',
												'is_highlighted',
												{
													button: [
														'id',
														'label',
														'variant',
														'url',
														'type',
														{ page: ['permalink'] },
														{ post: ['slug'] },
													],
												},
											],
										},
									],
									block_hero: [
										'tagline',
										'headline',
										'description',
										'layout',
										'image',
										{
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
													],
												},
											],
										},
									],
									block_posts: ['tagline', 'headline', 'collection', 'limit'],
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
				],
				deep: {
					blocks: { _sort: ['sort'], _filter: { hide_block: { _neq: true } } },
				},
			}),
		);

		if (!pageData.length) {
			throw createError({ statusCode: 404, statusMessage: 'Page not found' });
		}

		const page = pageData[0];

		if (Array.isArray(page?.blocks)) {
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

					const posts: Post[] = await directusServer.request(
						readItems('posts', {
							fields: ['id', 'title', 'description', 'slug', 'image', 'published_at'],
							filter: { status: { _eq: 'published' } },
							sort: ['-published_at'],
							limit,
						}),
					);

					(block.item as BlockPost & { posts: Post[] }).posts = posts;
				}
			}
		}

		return page;
	} catch {
		throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
	}
});
