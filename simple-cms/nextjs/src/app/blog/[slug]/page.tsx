import { fetchPostBySlug, fetchRelatedPosts, fetchAuthorById } from '@/lib/directus/fetchers';
import { draftMode } from 'next/headers';
import { Post } from '@/types/directus-schema';
import BlogPostClient from './BlogPostClient';

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
	const { isEnabled } = await draftMode();
	const { slug } = await params;

	let post: Post | null;
	try {
		post = await fetchPostBySlug(slug);
	} catch (error) {
		console.error('Error loading post:', error);

		return;
	}
	if (!post) {
		return <div className="text-center text-xl mt-[20%]">404 - Post Not Found</div>;
	}
	const relatedPosts = await fetchRelatedPosts(post.id);
	const author = post.author ? await fetchAuthorById(post.author as string) : null;
	const authorName = [author?.first_name, author?.last_name].filter(Boolean).join(' ');
	const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${slug}`;

	return (
		<BlogPostClient
			post={post}
			relatedPosts={relatedPosts}
			author={author}
			authorName={authorName}
			postUrl={postUrl}
			isDraft={isEnabled}
		/>
	);
}
