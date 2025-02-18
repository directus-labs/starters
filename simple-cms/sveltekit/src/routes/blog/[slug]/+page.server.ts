import { fetchPostBySlug } from '$lib/directus/fetchers';
import { PUBLIC_SITE_URL } from '$env/static/public';
import { getDirectusAssetURL } from '$lib/directus/directus-utils';
import type { PageServerLoad } from './$types';
export const load = (async (event) => {
    const slug = event.params.slug;
    try {
        const post = await fetchPostBySlug(slug);

        if (!post) {
            return;
        }

        const ogImage = post.image ? getDirectusAssetURL(post.image) : null;

        return {
            post,
            title: post.title,
            description: post.description,
            openGraph: {
                title: post.title,
                description: post.description,
                url: `${PUBLIC_SITE_URL}/blog/${slug}`,
                type: 'article',
                images: ogImage ? [{ url: ogImage }] : undefined,
            },
        };
    } catch (error) {
        console.error('Error loading post metadata:', error);

        return;
    }
}) satisfies PageServerLoad;