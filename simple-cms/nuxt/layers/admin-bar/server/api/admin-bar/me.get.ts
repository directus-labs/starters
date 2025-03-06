export default defineEventHandler(async (event) => {
	try {
		const config = useRuntimeConfig();

		const token = getCookie(event, 'directus_session_token');

		const { data: user } = await $fetch(`${config.public.directusUrl}/users/me`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			params: {
				fields: ['id', 'email', 'first_name', 'last_name', 'avatar'],
			},
		});

		return user;
	} catch (error) {
		console.error('Login error:', error);
		throw createError({
			statusCode: 401,
			message: 'Invalid credentials',
		});
	}
});
