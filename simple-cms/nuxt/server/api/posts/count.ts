import { defineEventHandler } from 'h3';
import { directusServer, readItems } from '../../utils/directus-server';

export default defineEventHandler(async () => {
	try {
		const response = await directusServer.request(
			readItems('posts', {
				aggregate: { count: '*' },
				filter: { status: { _eq: 'published' } },
			}),
		);

		return { total: Number(response[0]?.count) || 0 };
	} catch {
		throw createError({ statusCode: 500, message: 'Failed to fetch total post count' });
	}
});
