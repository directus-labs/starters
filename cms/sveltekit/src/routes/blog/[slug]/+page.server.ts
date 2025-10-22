import { fetchPostBySlug, fetchPostByIdAndVersion, getPostIdBySlug } from '$lib/directus/fetchers';
import { PUBLIC_SITE_URL } from '$env/static/public';
import { getDirectusAssetURL } from '$lib/directus/directus-utils';
import type { PageServerLoad } from './$types';
import type { DirectusUser } from '$lib/types/directus-schema';
import { error } from '@sveltejs/kit';
import { DRAFT_MODE_SECRET } from '$env/static/private';

export const load = (async (event) => {
	const id = event.url.searchParams.get('id') || '';
	let version = event.url.searchParams.get('version') || '' || undefined;
	const preview = event.url.searchParams.get('preview') === 'true';
	const token = event.url.searchParams.get('token') || '';
	const slug = event.params.slug;

	// Live preview adds version = main which is not required when fetching the main version.
	version = version != 'main' ? version : undefined;

	const isDraft =
		(preview && !!token) ||
		(!!version && version !== 'published') ||
		!!token ||
		(event.url.searchParams.get('draft') === 'true' && token === DRAFT_MODE_SECRET);

	try {
		let postId = id;
		if (version && !postId) {
			const foundPostId = await getPostIdBySlug(slug, token || undefined, event.fetch);
			if (!foundPostId) {
				error(404, {
					message: 'Post Not found'
				});
			}
			postId = foundPostId;
		}

		let result;
		if (postId && version) {
			result = await fetchPostByIdAndVersion(
				postId,
				version,
				slug,
				token || undefined,
				event.fetch
			);
		} else {
			result = await fetchPostBySlug(
				slug,
				{ draft: isDraft, token: token || undefined },
				event.fetch
			);
		}

		const { post, relatedPosts } = result;

		if (!post) {
			error(404, {
				message: 'Post Not found'
			});
		}

		const ogImage = post.image ? getDirectusAssetURL(post.image) : null;
		const author =
			post.author && typeof post.author === 'object' ? (post.author as DirectusUser) : null;

		return {
			post,
			author,
			relatedPosts,
			title: post?.seo?.title ?? post.title ?? '',
			description: post?.seo?.meta_description ?? '',
			openGraph: {
				title: post?.seo?.title ?? post.title ?? '',
				description: post?.seo?.meta_description ?? '',
				url: `${PUBLIC_SITE_URL}/blog/${slug}`,
				type: 'article',
				images: ogImage ? [{ url: ogImage }] : undefined
			}
		};
	} catch (error) {
		console.error('Error loading blog post:', error);
		throw error;
	}
}) satisfies PageServerLoad;
