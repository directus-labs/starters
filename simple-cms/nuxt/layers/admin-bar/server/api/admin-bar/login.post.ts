import { z } from 'zod';

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

export default defineEventHandler(async (event) => {
	const body = await readValidatedBody(event, (body) => loginSchema.safeParse(body));

	const config = useRuntimeConfig();

	if (!body.success) {
		throw createError({
			statusCode: 400,
			message: 'Invalid credentials format',
		});
	}

	try {
		const { email, password } = body.data;

		const response = await $fetch.raw(`${config.public.directusUrl}/auth/login`, {
			method: 'POST',
			body: {
				email,
				password,
				mode: 'session',
			},
		});

		const cookies = response.headers.getSetCookie();

		for (const cookie of cookies) {
			appendResponseHeader(event, 'set-cookie', cookie);
		}

		const { data: user } = await $fetch(`${config.public.directusUrl}/users/me`, {
			headers: {
				Cookie: cookies.join('; '),
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
