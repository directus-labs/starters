import { z } from 'zod';

const querySchema = z.object({
	collection: z.string(),
	item: z.union([z.string(), z.number()]),
});

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();

	const token = getCookie(event, 'directus_session_token');

	if (!token) {
		throw createError({
			statusCode: 401,
		});
	}

	try {
		const body = await getValidatedQuery(event, (body) => querySchema.safeParse(body));

		if (!body.success) {
			throw createError({
				statusCode: 400,
				message: 'Invalid query parameters',
			});
		}

		const { collection, item } = body.data;

		const { data: comments } = await $fetch(`${config.public.directusUrl}/comments`, {
			method: 'GET',
			params: {
				filter: {
					_and: [
						{
							collection: {
								_eq: collection,
							},
						},
						{
							item: {
								_eq: item,
							},
						},
					],
				},
				fields: ['*', 'user_created.id', 'user_created.first_name', 'user_created.last_name', 'user_created.avatar'],
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return comments;
	} catch (error) {
		console.error('Error fetching comments:', error);
		console.log(error.message);
		throw createError({
			statusCode: 500,
		});
	}
});
