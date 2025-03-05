export default function useAdminBar() {
	const adminBarState = useState('admin-bar', () => ({
		collection: '',
		item: {},
		title: '',
	}));

	const config = useRuntimeConfig();
	const isAdminBarEnabled = config.public.adminBarEnabled;

	// Check if user is authenticated
	// Check for directus session token
	const sessionToken = useCookie('directus_session_token');

	// console.log('sessionToken', sessionToken.value);
	// const { data } = useFetch('/api/auth/check-admin-bar');

	// if (!isAdminBarEnabled || !sessionToken.value) return;

	const showAdminBar = computed(() => isAdminBarEnabled);

	const setAdminBarState = ({ collection, item, title }: { collection: string; item: any; title: string }) => {
		adminBarState.value.collection = collection;
		adminBarState.value.item = item;
		adminBarState.value.title = title;
	};

	const collectionUrl = computed(() => {
		return `${config.public.directusUrl}/admin/content/${adminBarState.value.collection}`;
	});

	const editUrl = computed(() => {
		if (!adminBarState.value.collection || !adminBarState.value.item) return null;

		return `${config.public.directusUrl}/admin/content/${adminBarState.value.collection}/${adminBarState.value.item.id}`;
	});

	const newUrl = computed(() => {
		if (!adminBarState.value.collection) return null;

		return `${config.public.directusUrl}/admin/content/${adminBarState.value.collection}/+`;
	});

	const collectionLabel = computed(() => {
		return toTitleCase(singularize(adminBarState.value.collection));
	});

	return {
		isAdminBarEnabled,
		showAdminBar: toValue(showAdminBar),
		adminBarState,
		setAdminBarState,
		editUrl,
		newUrl,
		collectionLabel,
		collectionUrl,
	};
}
