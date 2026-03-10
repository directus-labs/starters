export function useLivePreview() {
	return usePreviewMode({
		// Enable preview mode when the preview param exists in the URL
		shouldEnable: () => {
			const route = useRoute();
			return !!route.query.preview;
		},

		// Store the token from the URL for use in API calls
		getState: (currentState) => {
			const route = useRoute();
			return {
				token: route.query.token || currentState.token,
			};
		},
	});
}
