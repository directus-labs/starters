import { isPreviewQueryValue } from '~/utils/preview-query';

export function useLivePreview() {
	return usePreviewMode({
		// `token` in the URL is ignored for auth (server uses DIRECTUS_SERVER_TOKEN)
		shouldEnable: () => isPreviewQueryValue(useRoute().query.preview),
	});
}
