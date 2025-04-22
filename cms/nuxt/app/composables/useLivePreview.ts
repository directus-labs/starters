export function useLivePreview() {
	return usePreviewMode({
		// Enable preview mode when both preview and token params exist in URL
		shouldEnable: () => {
			const route = useRoute();
			return !!route.query.preview && !!route.query.token;
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
