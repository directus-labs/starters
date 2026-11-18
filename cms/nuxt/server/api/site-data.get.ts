import type { SiteData, SiteNavigation } from '#shared/types/site-data';

export default defineEventHandler(async (_event): Promise<SiteData> => {
	try {
		const [globals, headerNavigation, footerNavigation] = await Promise.all([
			directusServer.request(
				readSingleton('globals', {
					fields: ['title', 'description', 'logo', 'logo_dark_mode', 'social_links', 'accent_color', 'favicon'],
				}),
			),
			directusServer.request(
				readItem('navigation', 'main', {
					fields: [
						'id',
						'title',
						{
							items: [
								'id',
								'title',
								'url',
								'type',
								{
									page: ['id', 'permalink'],
									post: ['id', 'slug'],
									children: [
										'id',
										'title',
										'url',
										'type',
										{
											page: ['id', 'permalink'],
											post: ['id', 'slug'],
										},
									],
								},
							],
						},
					],
					deep: {
						items: {
							_sort: ['sort'],
							children: {
								_sort: ['sort'],
							},
						},
					},
				}),
			),

			directusServer.request(
				readItem('navigation', 'footer', {
					fields: [
						'id',
						'title',
						{
							items: [
								'id',
								'title',
								'url',
								'type',
								{
									page: ['id', 'permalink'],
									post: ['id', 'slug'],
									children: [
										'id',
										'title',
										'url',
										'type',
										{
											page: ['id', 'permalink'],
											post: ['id', 'slug'],
										},
									],
								},
							],
						},
					],
					deep: {
						items: {
							_sort: ['sort'],
							children: {
								_sort: ['sort'],
							},
						},
					},
				}),
			),
		]);

		// The SDK can't narrow nested fields on `items` (typed as ids or objects in the schema), so it returns the
		// full Navigation type. The fields requested above match SiteNavigation, so assert that shape here once.
		return {
			globals,
			headerNavigation: headerNavigation as SiteNavigation,
			footerNavigation: footerNavigation as SiteNavigation,
		};
	} catch {
		throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
	}
});
