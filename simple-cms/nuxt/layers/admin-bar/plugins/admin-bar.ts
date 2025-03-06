// plugins/auth.ts
export default defineNuxtPlugin(async () => {
	const sessionToken = useCookie('directus_session_token');
	const { getUser, user } = useAdminBar();

	// Fetch person if session token is present and user is not logged in
	if (sessionToken.value && !user.value) {
		await getUser();
	}
});
