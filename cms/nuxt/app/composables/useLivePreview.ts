export function useLivePreview() {
	return usePreviewMode({
		// Match Directus live preview: only enable for preview=true
		shouldEnable: () => {
			const route = useRoute();
			return route.query.preview === 'true';
		},
	});
}
