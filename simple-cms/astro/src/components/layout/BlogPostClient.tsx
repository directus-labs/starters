'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import DirectusImage from '@/components/shared/DirectusImage';
import BaseText from '@/components/ui/Text';
import { Separator } from '@/components/ui/separator';
import ShareDialog from '@/components/ui/ShareDialog';
import Headline from '@/components/ui/Headline';
import Container from '@/components/ui/Container';
import type { Post } from '@/types/directus-schema';
import { setAttr } from '@directus/visual-editing';
import { useVisualEditing } from '@/hooks/useVisualEditing';

interface Author {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar: string | { id: string } | null;
}

interface BlogPostClientProps {
  initialPost: Post;
  relatedPosts: Post[];
  author?: Author | null;
  authorName: string;
  postUrl: string;
  slug?: string;
  token: string | null;
  isDraft?: boolean;
}

export default function BlogPostClient({
  initialPost,
  relatedPosts,
  author,
  authorName,
  postUrl,
  slug,
  token,
  isDraft,
}: BlogPostClientProps) {
  const { isVisualEditingEnabled, apply } = useVisualEditing();

  const [isPreviewEnabled, setIsPreviewEnabled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsPreviewEnabled(params.get('preview') === 'true');
  }, []);

  const shouldFetchLive = (isVisualEditingEnabled || isPreviewEnabled) && slug;

  const swrKey = shouldFetchLive
    ? `/api/blog-post/${encodeURIComponent(slug!)}${
        token
          ? `?token=${token}&preview=${isPreviewEnabled}&visual-editing=${isVisualEditingEnabled}`
          : `?preview=${isPreviewEnabled}&visual-editing=${isVisualEditingEnabled}`
      }`
    : null;

  const { data: swrData, mutate } = useSWR(
    swrKey,
    async (url: string) => {
      const res = await fetch(url);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch post');
      }

      const data = await res.json();
      return data.post as Post;
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  const post = shouldFetchLive ? (swrData ?? initialPost) : initialPost;

  useEffect(() => {
    if (isVisualEditingEnabled) {
      apply({
        onSaved: () => {
          mutate();
        },
      });
    }
  }, [isVisualEditingEnabled, apply, mutate]);

  if (!post) return null;

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
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
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
                    className="rounded-full object-cover"
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
                  <a
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="flex items-center space-x-4 hover:text-accent group"
                  >
                    {relatedPost.image && (
                      <div className="relative shrink-0 w-[150px] h-[100px] overflow-hidden rounded-lg">
                        <DirectusImage
                          uuid={relatedPost.image as string}
                          alt={relatedPost.title || 'related post'}
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          fill
                          sizes="(max-width: 768px) 100px, (max-width: 1024px) 150px, 150px"
                        />
                      </div>
                    )}
                    <span className="font-heading">{relatedPost.title}</span>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
