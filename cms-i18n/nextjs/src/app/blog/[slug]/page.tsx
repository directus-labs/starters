import { fetchPostBySlug, fetchPostByIdAndVersion, getPostIdBySlug } from '@/lib/directus/fetchers';
import BlogPostClient from './BlogPostClient';
import type { DirectusUser, Post } from '@/types/directus-schema';
import { getLocaleFromHeaders } from '@/lib/i18n/server';
import { addLocaleToPath } from '@/lib/i18n/utils';

export async function generateMetadata({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ id?: string; version?: string; preview?: string; token?: string }>;
}) {
	const { slug } = await params;
	const searchParamsResolved = await searchParams;
	const locale = await getLocaleFromHeaders();

	const preview = searchParamsResolved.preview === 'true';
	const version = typeof searchParamsResolved.version === 'string' ? searchParamsResolved.version : '';

	// Skip metadata generation for preview/versioned content
	if (preview || version) {
		return {
			title: 'Preview Mode',
			description: 'Content preview',
		};
	}

	try {
		const result = await fetchPostBySlug(slug, {
			draft: false,
			token: undefined,
			locale,
		});

		if (!result.post) return;

		const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
		const localizedPath = addLocaleToPath(`/blog/${slug}`, locale);

		return {
			title: result.post.seo?.title ?? result.post.title ?? '',
			description: result.post.seo?.meta_description ?? result.post.description ?? '',
			openGraph: {
				title: result.post.seo?.title ?? result.post.title ?? '',
				description: result.post.seo?.meta_description ?? result.post.description ?? '',
				url: `${siteUrl}${localizedPath}`,
				type: 'article',
				locale: locale,
			},
		};
	} catch (error) {
		console.error('Error loading blog post metadata:', error);
		return;
	}
}

export default async function BlogPostPage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ id?: string; version?: string; preview?: string; token?: string }>;
}) {
	const { slug } = await params;
	const { id, version, preview, token } = await searchParams;
	const locale = await getLocaleFromHeaders();
	const isDraft = (preview === 'true' && !!token) || (!!version && version !== 'published') || !!token;

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
		const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
		const localizedPath = addLocaleToPath(`/blog/${slug}`, locale);
		const postUrl = `${siteUrl}${localizedPath}`;

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
