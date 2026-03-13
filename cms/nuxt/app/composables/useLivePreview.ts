export function useLivePreview() {
	return usePreviewMode({
		// Enable preview mode when preview param exists in URL
		shouldEnable: () => {
			const route = useRoute();
			return !!route.query.preview;
		},
	});
}
