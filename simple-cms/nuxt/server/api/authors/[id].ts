import { defineEventHandler, getRouterParam } from 'h3';
import { directusServer, readItems } from '../../utils/directus-server';

export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, 'id');

	try {
		const authors = await directusServer.request(
			readItems('directus_users', {
				filter: { id: { _eq: id } },
				fields: ['first_name', 'last_name', 'avatar'],
			}),
		);

		if (!authors || authors.length === 0) {
			throw createError({ statusCode: 404, message: `Author not found: ${id}` });
		}

		return authors[0];
	} catch {
		throw createError({ statusCode: 500, message: `Failed to fetch author: ${id}` });
	}
});
