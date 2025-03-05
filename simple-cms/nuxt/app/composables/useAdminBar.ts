import type { DirectusUser } from '#shared/types/schema';

export default function useAdminBar() {
	const route = useRoute();

	const adminBarState = useState('admin-bar', () => ({
		collection: '',
		item: {} as Record<string, unknown>,
		title: '',
	}));

	const user = useState<DirectusUser | null>('user', () => null);

	const config = useRuntimeConfig();
	const isAdminBarEnabled = config.public.adminBarEnabled;

	// Check if user is authenticated
	// Check for directus session token
	const sessionToken = useCookie('directus_session_token');

	// Explicitly type the cookie as boolean with appropriate defaults
	const showAdminBarCookie = useCookie<boolean>('show_admin_bar', {
		default: () => false,
	});

	if (route.query.show_admin_bar === 'true') {
		showAdminBarCookie.value = true;
	}

	// console.log('sessionToken', sessionToken.value);
	// const { data } = useFetch('/api/auth/check-admin-bar');

	// if (!isAdminBarEnabled || !sessionToken.value) return;

	const showAdminBar = computed(() => isAdminBarEnabled && showAdminBarCookie.value === true);

	function hideAdminBar() {
		// Remove console.log to fix linter error
		showAdminBarCookie.value = false;
	}

	const setAdminBarState = ({
		collection,
		item,
		title,
	}: {
		collection: string;
		item: Record<string, unknown>;
		title: string;
	}) => {
		adminBarState.value.collection = collection;
		adminBarState.value.item = item;
		adminBarState.value.title = title;
	};

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

	async function login(email: string, password: string) {
		try {
			const response = await $fetch('/api/admin-bar/login', {
				method: 'POST',
				body: { email, password },
			});

			user.value = response;
		} catch (error) {
			// Consider using a more appropriate logging approach in production
			console.error('Login error:', error);
		}
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
	};
}
