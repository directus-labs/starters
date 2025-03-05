export default defineEventHandler(async (event) => {
	const sessionToken = getCookie(event, 'directus_session_token');

	if (sessionToken) {
		return {
			authenticated: true,
			sessionToken,
		};
	}

	return {
		authenticated: false,
	};
});
