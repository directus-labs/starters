import { fetchAuthorById, fetchPostBySlug, fetchRelatedPosts } from '$lib/directus/fetchers';
import { PUBLIC_SITE_URL } from '$env/static/public';
import { getDirectusAssetURL } from '$lib/directus/directus-utils';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
export const load = (async (event) => {
    const slug = event.params.slug;
    const post = await fetchPostBySlug(slug);

    if (!post) {
        error(404, {
            message: 'Post Not found'
        });
    }
    // TODO optimize this to run in parallel
    const ogImage = post.image ? getDirectusAssetURL(post.image) : null;
    const relatedPosts = await fetchRelatedPosts(post.id);
    const author = post.author ? await fetchAuthorById(post.author as string) : null;

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
            images: ogImage ? [{ url: ogImage }] : undefined,
        },
    };

}) satisfies PageServerLoad;