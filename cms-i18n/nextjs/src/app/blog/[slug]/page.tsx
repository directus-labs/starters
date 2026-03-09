import { fetchPostBySlug, fetchPostByIdAndVersion, getPostIdBySlug } from '@/lib/directus/fetchers';
import BlogPostClient from './BlogPostClient';
import type { DirectusUser, Post } from '@/types/directus-schema';
import { getLocaleFromHeaders } from '@/lib/i18n/server';
import { addLocaleToPath } from '@/lib/i18n/utils';

export default async function BlogPostPage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ id?: string; version?: string; preview?: string; token?: string }>;
}) {
	const { slug } = await params;
	const { id, version, preview, token } = await searchParams;
	const isDraft = (preview === 'true' && !!token) || (!!version && version !== 'published') || !!token;
	const locale = await getLocaleFromHeaders();

	// Live preview adds version = main which is not required when fetching the main version.
	const fixedVersion = version != 'main' ? version : undefined;
	try {
		let postId = id;
		let post: Post | null;
		let relatedPosts: Post[] = [];
		// Content Version Fetching
		if (fixedVersion && !postId) {
			const foundPostId = await getPostIdBySlug(slug, token || undefined);
			if (!foundPostId) {
				return <div className="text-center text-xl mt-[20%]">404 - Post Not Found</div>;
			}
			postId = foundPostId;
		}

		if (postId && fixedVersion) {
			const result = await fetchPostByIdAndVersion(postId, fixedVersion, slug, token || undefined, locale);
			post = result.post;
			relatedPosts = result.relatedPosts;
		} else {
			const result = await fetchPostBySlug(slug, {
				draft: isDraft,
				token,
				locale,
			});
			post = result.post;
			relatedPosts = result.relatedPosts;
		}

		if (!post) {
			return <div className="text-center text-xl mt-[20%]">404 - Post Not Found</div>;
		}

		const author = post.author as DirectusUser | null;
		const authorName = author ? [author.first_name, author.last_name].filter(Boolean).join(' ') : '';
		const localizedBlogPath = addLocaleToPath(`/blog/${slug}`, locale);
		const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${localizedBlogPath}`;

		return (
			<BlogPostClient
				post={post}
				relatedPosts={relatedPosts}
				author={author}
				authorName={authorName}
				postUrl={postUrl}
			/>
		);
	} catch (error) {
		console.error('Error loading blog post:', error);

		return <div className="text-center text-xl mt-[20%]">404 - Post Not Found</div>;
	}
}
