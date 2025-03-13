import type { DirectusUser, Page, Post } from '#shared/types/schema';

// Define types for better type safety
type AdminBarItem = Page | Post;

interface AdminBarState {
	collection: string;
	item: AdminBarItem | null; // Make nullable to avoid type casting empty objects
	title: string;
}

interface LoginCredentials {
	email: string;
	password: string;
}

export default function useAdminBar() {
	const route = useRoute();
	const config = useRuntimeConfig();

	// State Management
	const adminBarState = useState<AdminBarState>('admin-bar', () => ({
		collection: '',
		item: null,
		title: '',
	}));

	const user = useState<DirectusUser | null>('user', () => null);
	const sessionToken = useCookie('directus_session_token');
	const showAdminBarCookie = useCookie<boolean>('show_admin_bar', {
		default: () => false,
	});

	// Check if the admin bar is enabled at the site level. Disables the admin bar entirely if disabled.
	const isAdminBarEnabled = config.public.adminBarEnabled;

	// Activate the admin bar via the query parameter and then set the cookie for persistence
	if (route.query.show_admin_bar === 'true') {
		showAdminBarCookie.value = true;
	}

	// Show the admin bar if the cookie is set to true and the admin bar is enabled
	const showAdminBar = computed(() => isAdminBarEnabled && showAdminBarCookie.value === true);

	const collectionUrl = computed(() => {
		return `${config.public.directusUrl}/admin/content/${adminBarState.value.collection}`;
	});

	const editUrl = computed(() => {
		if (!adminBarState.value.collection || !adminBarState.value.item) return null;

		const itemId = adminBarState.value.item.id as string;
		return `${config.public.directusUrl}/admin/content/${adminBarState.value.collection}/${itemId}`;
	});

	const newUrl = computed(() => {
		if (!adminBarState.value.collection) return null;

		return `${config.public.directusUrl}/admin/content/${adminBarState.value.collection}/+`;
	});

	const collectionLabel = computed(() => {
		return toTitleCase(singularize(adminBarState.value.collection));
	});

	/**
	 * Hide the admin bar
	 * @returns void
	 */
	function hideAdminBar() {
		showAdminBarCookie.value = false;
	}

	/**
	 * Set the admin bar state
	 * @param collection - The collection of the item
	 * @param item - The item to display in the admin bar
	 * @param title - The title of the item
	 * @returns void
	 */
	function setAdminBarState({ collection, item, title }: { collection: string; item: Page | Post; title: string }) {
		adminBarState.value.collection = collection;
		adminBarState.value.item = item;
		adminBarState.value.title = title;
	}

	/**
	 * Login to the admin bar
	 * @param email - The email of the user
	 * @param password - The password of the user
	 * @returns void
	 */
	async function login({ email, password }: LoginCredentials) {
		try {
			const response = await $fetch('/api/admin-bar/login', {
				method: 'POST',
				body: { email, password },
			});

			user.value = response as DirectusUser;
		} catch (error) {
			throw createError({
				message: 'Failed to login',
				data: error,
			});
		}
	}

	/**
	 * Get the user from the admin bar
	 * @returns void
	 */
	async function getUser() {
		try {
			const { data: userData } = await useFetch('/api/admin-bar/me', {
				headers: {
					Cookie: `directus_session_token=${sessionToken.value}`,
				},
			});

			user.value = userData.value as DirectusUser;
		} catch (error) {
			throw createError({
				message: 'Failed to get user',
				data: error,
			});
		}
	}

	/**
	 * Logout from the admin bar
	 * @returns void
	 */
	function logout() {
		sessionToken.value = null;
		user.value = null;
	}

	return {
		isAdminBarEnabled,
		showAdminBar,
		adminBarState,
		setAdminBarState,
		editUrl,
		newUrl,
		collectionLabel,
		collectionUrl,
		login,
		user,
		hideAdminBar,
		sessionToken,
		getUser,
		logout,
	};
}
