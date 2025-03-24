import React from 'react';
import { useState, useEffect } from 'react';
import { ChevronFirst, ChevronLast } from 'lucide-react';
import Tagline from '../ui/Tagline';
import Headline from '@/components/ui/Headline';
import DirectusImage from '@/components/shared/DirectusImage';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';
import type { Post } from '@/types/directus-schema';
import { fetchPaginatedPosts, fetchTotalPostCount } from '@/lib/directus/fetchers';
import { setAttr, useDirectusVisualEditing } from '@/lib/directus/visual-editing-helper';

interface PostsProps {
  data: {
    tagline?: string;
    headline?: string;
    posts: Post[];
    limit: number;
  };
  itemId?: string;
}

const Posts = ({ data, itemId }: PostsProps) => {
  const postsData = useDirectusVisualEditing(data, itemId, 'block_posts');
  const { tagline, headline, posts, limit } = postsData;

  const visiblePages = 5;
  const perPage = limit || 6;

  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      return Number(sp.get('page')) || 1;
    }

    return 1;
  });

  const [paginatedPosts, setPaginatedPosts] = useState<Post[]>(currentPage === 1 ? posts : []);

  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchTotalPages = async () => {
      try {
        const totalCount = await fetchTotalPostCount();
        setTotalPages(Math.ceil(totalCount / perPage));
      } catch (error) {
        console.error('Error fetching total post count:', error);
      }
    };

    fetchTotalPages();
  }, [perPage]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (currentPage === 1) {
          setPaginatedPosts(posts);

          return;
        }

        const response = await fetchPaginatedPosts(perPage, currentPage);
        setPaginatedPosts(response);
      } catch (error) {
        console.error('Error fetching paginated posts:', error);
      }
    };

    fetchPosts();
  }, [currentPage, perPage, posts]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);

      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', `?page=${page}`);
      }
    }
  };

  const generatePagination = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= visiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const rangeStart = Math.max(1, currentPage - 2);
      const rangeEnd = Math.min(totalPages, currentPage + 2);

      if (rangeStart > 1) {
        pages.push('ellipsis-start');
      }

      for (let i = rangeStart; i <= rangeEnd; i++) {
        pages.push(i);
      }

      if (rangeEnd < totalPages) {
        pages.push('ellipsis-end');
      }
    }

    return pages;
  };

  const paginationLinks = generatePagination();

  return (
    <div>
      {tagline && (
        <Tagline
          tagline={tagline}
          data-directus={
            itemId
              ? setAttr({
                  collection: 'block_posts',
                  item: itemId,
                  fields: 'tagline',
                  mode: 'popover',
                })
              : undefined
          }
        />
      )}
      {headline && (
        <Headline
          headline={headline}
          data-directus={
            itemId
              ? setAttr({
                  collection: 'block_posts',
                  item: itemId,
                  fields: 'headline',
                  mode: 'popover',
                })
              : undefined
          }
        />
      )}

      <div
        className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        data-directus={
          itemId
            ? setAttr({
                collection: 'block_posts',
                item: itemId,
                fields: ['posts'],
                mode: 'modal',
              })
            : undefined
        }
      >
        {paginatedPosts.length > 0 ? (
          paginatedPosts.map((post) => (
            <a key={post.id} href={`/blog/${post.slug}`} className="group block overflow-hidden rounded-lg">
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                {post.image && (
                  <DirectusImage
                    uuid={typeof post.image === 'string' ? post.image : post.image?.id}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="w-full h-auto object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="text-xl group-hover:text-accent font-heading transition-colors duration-300">
                  {post.title}
                </h3>
                {post.description && <p className="text-sm text-foreground mt-2">{post.description}</p>}
              </div>
            </a>
          ))
        ) : (
          <p className="text-center text-gray-500">No posts available.</p>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {totalPages > visiblePages && currentPage > 1 && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(1);
                  }}
                >
                  <ChevronFirst className="size-5" />
                </PaginationLink>
              </PaginationItem>
            )}

            {totalPages > visiblePages && currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                />
              </PaginationItem>
            )}

            {paginationLinks.map((page, index) =>
              typeof page === 'number' ? (
                <PaginationItem key={index}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === page}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ) : (
                <PaginationItem key={index}>
                  <PaginationEllipsis />
                </PaginationItem>
              ),
            )}

            {totalPages > visiblePages && currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                />
              </PaginationItem>
            )}

            {totalPages > visiblePages && currentPage < totalPages && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(totalPages);
                  }}
                >
                  <ChevronLast className="size-5" />
                </PaginationLink>
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default Posts;
