'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setAttr } from '@directus/visual-editing';
import { useVisualEditing } from '@/hooks/useVisualEditing';
import DirectusImage from '@/components/shared/DirectusImage';
import BaseText from '@/components/ui/Text';
import { Separator } from '@/components/ui/separator';
import ShareDialog from '@/components/ui/ShareDialog';
import Link from 'next/link';
import Headline from '@/components/ui/Headline';
import Container from '@/components/ui/container';
import { Post, DirectusUser } from '@/types/directus-schema';

interface BlogPostClientProps {
	post: Post;
	relatedPosts: Post[];
	author?: DirectusUser | null;
	authorName: string;
	postUrl: string;
	isDraft?: boolean;
}

export default function BlogPostClient({
	post,
	relatedPosts,
	author,
	authorName,
	postUrl,
	isDraft,
}: BlogPostClientProps) {
	const { isVisualEditingEnabled, apply } = useVisualEditing();
	const router = useRouter();

	useEffect(() => {
		if (isVisualEditingEnabled) {
			apply({
				onSaved: () => {
					router.refresh();
				},
			});
		}
	}, [isVisualEditingEnabled, apply, router]);

	return (
		<>
			{isDraft && <p>(Draft Mode)</p>}

			<Container className="py-12">
				{post.image && (
					<div className="mb-8">
						<div
							className="relative w-full h-[400px] overflow-hidden rounded-lg"
							data-directus={setAttr({
								collection: 'posts',
								item: post.id,
								fields: ['image', 'meta_header_image'],
								mode: 'modal',
							})}
						>
							<DirectusImage
								uuid={post.image as string}
								alt={post.title || 'post header image'}
								className="object-cover"
								fill
							/>
						</div>
					</div>
				)}

				<Headline
					as="h2"
					headline={post.title}
					className="!text-accent mb-4"
					data-directus={setAttr({
						collection: 'posts',
						item: post.id,
						fields: ['title', 'slug'],
						mode: 'popover',
					})}
				/>
				<Separator className="mb-8" />

				<div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_2fr)_400px] gap-12">
					<main className="text-left">
						<BaseText
							content={post.content || ''}
							data-directus={setAttr({
								collection: 'posts',
								item: post.id,
								fields: ['content', 'meta_header_content'],
								mode: 'drawer',
							})}
						/>
					</main>

					<aside className="space-y-6 p-6 rounded-lg max-w-[496px] h-fit bg-background-muted">
						{author && (
							<div
								className="flex items-center space-x-4"
								data-directus={setAttr({
									collection: 'posts',
									item: post.id,
									fields: ['author'],
									mode: 'popover',
								})}
							>
								{author.avatar && (
									<DirectusImage
										uuid={typeof author.avatar === 'string' ? author.avatar : author.avatar.id}
										alt={authorName || 'author avatar'}
										className="rounded-full object-cover size-[48px]"
										width={48}
										height={48}
									/>
								)}
								<div>{authorName && <p className="font-bold">{authorName}</p>}</div>
							</div>
						)}

						{post.description && (
							<p
								data-directus={setAttr({
									collection: 'posts',
									item: post.id,
									fields: 'description',
									mode: 'popover',
								})}
							>
								{post.description}
							</p>
						)}

						<div className="flex justify-start">
							<ShareDialog postUrl={postUrl} postTitle={post.title} />
						</div>

						<div>
							<Separator className="my-4" />
							<h3 className="font-bold mb-4">Related Posts</h3>
							<div className="space-y-4">
								{relatedPosts.map((relatedPost) => (
									<Link
										key={relatedPost.id}
										href={`/blog/${relatedPost.slug}`}
										className="flex items-center space-x-4 hover:text-accent group"
									>
										{relatedPost.image && (
											<div className="relative shrink-0 w-[150px] h-[100px] overflow-hidden rounded-lg">
												<DirectusImage
													uuid={relatedPost.image as string}
													alt={relatedPost.title || 'related posts'}
													className="object-cover transition-transform duration-300 group-hover:scale-110"
													fill
													sizes="(max-width: 768px) 100px, (max-width: 1024px) 150px, 150px"
												/>
											</div>
										)}
										<span className="font-heading">{relatedPost.title}</span>
									</Link>
								))}
							</div>
						</div>
					</aside>
				</div>
			</Container>
		</>
	);
}
