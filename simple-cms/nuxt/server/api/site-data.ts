import { defineEventHandler } from 'h3';
import { directusServer, readSingleton, readItem } from '../utils/directus-server';

export default defineEventHandler(async () => {
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
								{ page: ['permalink'] },
								{
									children: ['id', 'title', 'url', { page: ['permalink'] }],
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
								{ page: ['permalink'] },
								{
									children: ['id', 'title', 'url', { page: ['permalink'] }],
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

		return { globals, headerNavigation, footerNavigation };
	} catch (error) {
		throw createError({ statusCode: 500, statusMessage: 'Failed to fetch site data' });
	}
});
