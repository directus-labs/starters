import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { type BlockPost, type PageBlock, type Post, type Schema } from '../types/directus-schema';
import { useDirectus } from './directus';
import { type QueryFilter, aggregate, readItem, readSingleton, withToken } from '@directus/sdk';

/**
 * Fetches page data by permalink, including all nested blocks and dynamically fetching blog posts if required.
 */
export const fetchPageData = async (
	permalink: string,
	postPage = 1,
	fetch: RequestEvent['fetch'],
	token?: string,
	preview?: boolean
) => {
	const { getDirectus, readItems } = useDirectus();
	const directus = getDirectus(fetch);

	const queryOptions = {
		filter:
			preview && token
				? { permalink: { _eq: permalink } }
				: { permalink: { _eq: permalink }, status: { _eq: 'published' } },
		limit: 1,
		fields: [
			'id',
			'title',
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
							block_richtext: ['id', 'tagline', 'headline', 'content', 'alignment'],
							block_gallery: [
								'id',
								'tagline',
								'headline',
								{ items: ['id', 'directus_file', 'sort'] }
							],
							block_pricing: [
								'id',
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
												{ post: ['slug'] }
											]
										}
									]
								}
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
											buttons: [
												'id',
												'label',
												'variant',
												'url',
												'type',
												{ page: ['permalink'] },
												{ post: ['slug'] }
											]
										}
									]
								}
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
												'sort'
											]
										}
									]
								}
							]
						}
					}
				]
			}
		],
		deep: {
			blocks: { _sort: ['sort'], _filter: { hide_block: { _neq: true } } }
		}
	};

	let pageData;
	if (preview && token && token.trim()) {
		pageData = (await directus.request(
			withToken(token, readItems('pages', queryOptions as any))
		)) as any[];
	} else {
		pageData = (await directus.request(readItems('pages', queryOptions as any))) as any[];
	}

	if (pageData.length === 0) {
		error(404, {
			message: 'Not found'
		});
	}

	const page = pageData[0] as any;

	if (Array.isArray(page.blocks)) {
		for (const block of page.blocks as PageBlock[]) {
			if (
				block.collection === 'block_posts' &&
				typeof block.item === 'object' &&
				(block.item as BlockPost).collection === 'posts'
			) {
				const limit = (block.item as BlockPost).limit ?? 6;
				const posts = await directus.request<Post[]>(
					readItems('posts', {
						fields: ['id', 'title', 'description', 'slug', 'image', 'status', 'published_at'],
						filter: { status: { _eq: 'published' } },
						sort: ['-published_at'],
						limit,
						page: postPage
					})
				);

				(block.item as BlockPost & { posts: Post[] }).posts = posts;
			}
		}
	}

	return page;
};

/**
 * Fetches global site data, header navigation, and footer navigation.
 */
export const fetchSiteData = async (fetch: RequestEvent['fetch']) => {
	const { getDirectus } = useDirectus();
	const directus = getDirectus(fetch);

	try {
		const [globals, headerNavigation, footerNavigation] = await Promise.all([
			directus.request(
				readSingleton('globals', {
					fields: [
						'id',
						'title',
						'description',
						'logo',
						'logo_dark_mode',
						'social_links',
						'accent_color',
						'favicon'
					]
				})
			),
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
									children: ['id', 'title', 'url', { page: ['permalink'] }]
								}
							]
						}
					],
					deep: { items: { _sort: ['sort'] } }
				})
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
									children: ['id', 'title', 'url', { page: ['permalink'] }]
								}
							]
						}
					]
				})
			)
		]);

		return { globals, headerNavigation, footerNavigation };
	} catch (error) {
		console.error('Error fetching site data:', error);
		throw new Error('Failed to fetch site data');
	}
};

/**
 * Fetches a single blog post by slug. Handles live preview mode
 */
export const fetchPostBySlug = async (
	slug: string,
	options: { draft?: boolean; token?: string },
	fetch: RequestEvent['fetch']
) => {
	const { getDirectus, readItems } = useDirectus();
	const directus = getDirectus(fetch);

	try {
		const { draft, token } = options || {};
		const filter: QueryFilter<Schema, Post> =
			token || draft
				? { slug: { _eq: slug } }
				: { slug: { _eq: slug }, status: { _eq: 'published' } };

		const queryOptions = {
			filter,
			limit: 1,
			fields: [
				'id',
				'title',
				'content',
				'status',
				'image',
				'description',
				{ author: ['id', 'first_name', 'last_name', 'avatar'] },
				'seo'
			]
		};

		let posts;
		if (token && token.trim()) {
			posts = (await directus.request(
				withToken(token, readItems('posts', queryOptions as any))
			)) as any[];
		} else {
			posts = (await directus.request(readItems('posts', queryOptions as any))) as any[];
		}

		const post = posts[0] as any;

		if (!post) {
			console.error(`No post found with slug: ${slug}`);

			return null;
		}

		return post;
	} catch (error) {
		console.error(`Error fetching post with slug "${slug}":`, error);
		throw new Error(`Failed to fetch post with slug "${slug}"`);
	}
};

/**
 * Fetches related blog posts excluding the given ID.
 */
export const fetchRelatedPosts = async (excludeId: string, fetch: RequestEvent['fetch']) => {
	const { getDirectus, readItems } = useDirectus();
	const directus = getDirectus(fetch);

	try {
		const relatedPosts = await directus.request(
			readItems('posts', {
				filter: { status: { _eq: 'published' }, id: { _neq: excludeId } },
				fields: ['id', 'title', 'image', 'slug'],
				limit: 2
			})
		);

		return relatedPosts;
	} catch (error) {
		console.error('Error fetching related posts:', error);
		throw new Error('Failed to fetch related posts');
	}
};

/**
 * Fetches author details by ID.
 */
export const fetchAuthorById = async (authorId: string, fetch: RequestEvent['fetch']) => {
	const { getDirectus, readUser } = useDirectus();
	const directus = getDirectus(fetch);

	try {
		const author = await directus.request(
			readUser(authorId, {
				fields: ['first_name', 'last_name', 'avatar']
			})
		);

		return author;
	} catch (error) {
		console.error(`Error fetching author with ID "${authorId}":`, error);
		throw new Error(`Failed to fetch author with ID "${authorId}"`);
	}
};

/**
 * Fetches paginated blog posts. - Runs Client side
 */
export const fetchPaginatedPosts = async (limit: number, page: number) => {
	const { getDirectus, readItems } = useDirectus();
	const directus = getDirectus(fetch);
	try {
		const response = await directus.request(
			readItems('posts', {
				limit,
				page,
				sort: ['-published_at'],
				fields: ['id', 'title', 'description', 'slug', 'image'],
				filter: { status: { _eq: 'published' } }
			})
		);

		return response;
	} catch (error) {
		console.error('Error fetching paginated posts:', error);
		throw new Error('Failed to fetch paginated posts');
	}
};

/**
 * Fetches the total number of published blog posts. - Runs Client side
 */
export const fetchTotalPostCount = async (): Promise<number> => {
	const { getDirectus } = useDirectus();
	const directus = getDirectus(fetch);

	try {
		const response = await directus.request(
			aggregate('posts', {
				aggregate: { count: '*' },
				filter: { status: { _eq: 'published' } }
			})
		);

		return Number(response[0]?.count) || 0;
	} catch (error) {
		console.error('Error fetching total post count:', error);

		return 0;
	}
};

/**
 * Fetches page data by id and version
 */
export const fetchPageDataById = async (
	id: string,
	version: string,
	token: string | undefined,
	fetch: RequestEvent['fetch']
) => {
	const { getDirectus } = useDirectus();
	const directus = getDirectus(fetch);

	try {
		const pageFields = [
			'title',
			'id',
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
							block_richtext: ['id', 'tagline', 'headline', 'content', 'alignment'],
							block_gallery: [
								'id',
								'tagline',
								'headline',
								{ items: ['id', 'directus_file', 'sort'] }
							],
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
											button: [
												'id',
												'label',
												'variant',
												'url',
												'type',
												{ page: ['permalink'] },
												{ post: ['slug'] }
											]
										}
									]
								}
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
											buttons: [
												'id',
												'label',
												'variant',
												'url',
												'type',
												{ page: ['permalink'] },
												{ post: ['slug'] }
											]
										}
									]
								}
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
												'sort'
											]
										}
									]
								}
							]
						}
					}
				]
			}
		];

		let request = (readItem as any)('pages', id, {
			version,
			fields: pageFields as any,
			deep: {
				blocks: { _sort: ['sort'], _filter: { hide_block: { _neq: true } } }
			}
		});

		if (token && token.trim()) {
			request = withToken(token, request);
		}

		return await directus.request(request);
	} catch (error) {
		console.error('Error fetching versioned page:', error);
		throw new Error('Failed to fetch versioned page');
	}
};

/**
 * Helper function to get page ID by permalink
 */
export const getPageIdByPermalink = async (
	permalink: string,
	token: string | undefined,
	fetch: RequestEvent['fetch']
) => {
	const { getDirectus, readItems } = useDirectus();
	const directus = getDirectus(fetch);

	try {
		const queryOptions = {
			filter: { permalink: { _eq: permalink } },
			limit: 1,
			fields: ['id']
		};

		let pageData;
		if (token && token.trim()) {
			pageData = (await directus.request(
				withToken(token, readItems('pages', queryOptions as any))
			)) as any[];
		} else {
			pageData = (await directus.request(readItems('pages', queryOptions as any))) as any[];
		}

		if (pageData.length > 0) {
			return pageData[0]?.id;
		}

		return null;
	} catch (error) {
		console.error('Error getting page ID:', error);
		return null;
	}
};

/**
 * Helper function to get post ID by slug
 */
export const getPostIdBySlug = async (
	slug: string,
	token: string | undefined,
	fetch: RequestEvent['fetch']
) => {
	const { getDirectus, readItems } = useDirectus();
	const directus = getDirectus(fetch);

	try {
		const queryOptions = {
			filter: { slug: { _eq: slug } },
			limit: 1,
			fields: ['id']
		};

		let postData;
		if (token && token.trim()) {
			postData = (await directus.request(
				withToken(token, readItems('posts', queryOptions as any))
			)) as any[];
		} else {
			postData = (await directus.request(readItems('posts', queryOptions as any))) as any[];
		}

		if (postData.length > 0) {
			return postData[0]?.id;
		}

		return null;
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
	token: string | undefined,
	fetch: RequestEvent['fetch']
): Promise<{ post: Post; relatedPosts: Post[] }> => {
	const { getDirectus } = useDirectus();
	const directus = getDirectus(fetch);

	try {
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
			{
				author: ['id', 'first_name', 'last_name', 'avatar']
			}
		];

		let request = (readItem as any)('posts', id, {
			version,
			fields: postFields as any
		});

		if (token && token.trim()) {
			request = withToken(token, request);
		}

		const [postData, relatedPosts] = await Promise.all([
			directus.request(request),
			fetchRelatedPosts(id, fetch)
		]);

		return { post: postData as any as Post, relatedPosts };
	} catch (error) {
		console.error('Error fetching versioned post:', error);
		throw new Error('Failed to fetch versioned post');
	}
};
