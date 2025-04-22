export default defineCachedEventHandler(
	async (event) => {
		const query = getQuery(event);
		const search = query.search as string;

		if (!search || search.length < 3) {
			throw createError({ statusCode: 400, message: 'Query must be at least 3 characters.' });
		}

		try {
			const [pages, posts] = await Promise.all([
				directusServer.request(
					readItems('pages', {
						filter: {
							_or: [{ title: { _contains: search } }, { permalink: { _contains: search } }],
						},
						fields: ['id', 'title', 'permalink'],
					}),
				),

				directusServer.request(
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
				...pages.map((page: Page) => ({
					id: page.id,
					title: page.title,
					type: 'Page',
					link: `/${page.permalink.replace(/^\/+/, '')}`,
					content: '',
				})),

				...posts.map((post: Post) => ({
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
			return `search-${query.search}`;
		},
	},
);
