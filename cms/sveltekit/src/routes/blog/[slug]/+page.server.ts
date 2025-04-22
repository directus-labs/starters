import { fetchAuthorById, fetchPostBySlug, fetchRelatedPosts } from '$lib/directus/fetchers';
import { PUBLIC_SITE_URL } from '$env/static/public';
import { getDirectusAssetURL } from '$lib/directus/directus-utils';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { DRAFT_MODE_SECRET } from '$env/static/private';
export const load = (async (event) => {
	const draft = event.url.searchParams.get('draft') === 'true' && event.url.searchParams.get('token') === DRAFT_MODE_SECRET;
	const slug = event.params.slug;
	const post = await fetchPostBySlug(slug, { draft }, event.fetch);

	if (!post) {
		error(404, {
			message: 'Post Not found'
		});
	}
	// TODO optimize this to run in parallel
	const ogImage = post.image ? getDirectusAssetURL(post.image) : null;
	const relatedPosts = await fetchRelatedPosts(post.id, event.fetch);
	const author = post.author ? await fetchAuthorById(post.author as string, event.fetch) : null;

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
}) satisfies PageServerLoad;
