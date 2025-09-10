import {
	fetchPostBySlug,
	fetchPostByIdAndVersion,
	getPostIdBySlug,
	fetchRelatedPosts
} from '$lib/directus/fetchers';
import { PUBLIC_SITE_URL } from '$env/static/public';
import { getDirectusAssetURL } from '$lib/directus/directus-utils';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { DRAFT_MODE_SECRET } from '$env/static/private';

export const load = (async (event) => {
	const id = event.url.searchParams.get('id') || '';
	const version = event.url.searchParams.get('version') || '';
	const preview = event.url.searchParams.get('preview') === 'true';
	const token = event.url.searchParams.get('token') || '';
	const slug = event.params.slug;

	const isDraft =
		(preview && !!token) ||
		(!!version && version !== 'published') ||
		!!token ||
		(event.url.searchParams.get('draft') === 'true' && token === DRAFT_MODE_SECRET);

	try {
		let postId = id;
		if (version && !postId) {
			const foundPostId = await getPostIdBySlug(slug, token || undefined, event.fetch);
			postId = foundPostId || '';
		}

		let post;
		if (postId && version) {
			const result = await fetchPostByIdAndVersion(
				postId,
				version,
				slug,
				token || undefined,
				event.fetch
			);
			post = result.post;
		} else {
			post = await fetchPostBySlug(
				slug,
				{ draft: isDraft, token: token || undefined },
				event.fetch
			);
		}

		if (!post) {
			error(404, {
				message: 'Post Not found'
			});
		}

		// TODO optimize this to run in parallel
		const ogImage = post.image ? getDirectusAssetURL(post.image) : null;
		const relatedPosts = await fetchRelatedPosts(post.id, event.fetch);
		const author = post.author && typeof post.author === 'object' ? (post.author as any) : null;

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
