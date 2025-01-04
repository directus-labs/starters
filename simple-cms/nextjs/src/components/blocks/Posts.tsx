'use client';

import { useState, useEffect } from 'react';
import Tagline from '../ui/Tagline';
import Headline from '@/components/ui/Headline';
import DirectusImage from '@/components/shared/DirectusImage';
import Link from 'next/link';
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '../ui/pagination';
import { Post } from '@/types/directus-schema';
import { fetchPaginatedPosts, fetchTotalPostCount } from '@/lib/directus/fetchers';

interface PostsProps {
	data: {
		tagline?: string;
		headline?: string;
		posts: Post[];
	};
}

const Posts = ({ data }: PostsProps) => {
	const { tagline, headline, posts } = data;
	const perPage = 6;

	const [currentPage, setCurrentPage] = useState(1);
	const [paginatedPosts, setPaginatedPosts] = useState<Post[]>(posts);
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
	}, [currentPage, perPage]);

	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	return (
		<div>
			{tagline && <Tagline tagline={tagline} />}
			{headline && <Headline headline={headline} />}

			<div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
				{paginatedPosts.length > 0 ? (
					paginatedPosts.map((post) => (
						<Link key={post.id} href={`/blog/${post.slug}`} className="group block overflow-hidden rounded-lg">
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
								<p className="text-sm text-foreground mt-2">{post.description}</p>
							</div>
						</Link>
					))
				) : (
					<p className="text-center text-gray-500">No posts available.</p>
				)}
			</div>

			{totalPages > 1 && (
				<Pagination>
					<PaginationContent>
						{currentPage > 1 && (
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

						{Array.from({ length: totalPages }, (_, i) => (
							<PaginationItem key={i}>
								<PaginationLink
									href="#"
									isActive={currentPage === i + 1}
									onClick={(e) => {
										e.preventDefault();
										handlePageChange(i + 1);
									}}
								>
									{i + 1}
								</PaginationLink>
							</PaginationItem>
						))}

						{totalPages > 5 && (
							<PaginationItem>
								<PaginationEllipsis />
							</PaginationItem>
						)}

						{currentPage < totalPages && (
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
					</PaginationContent>
				</Pagination>
			)}
		</div>
	);
};

export default Posts;
