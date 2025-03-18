'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface AdminBarProps {
	contentId: string;
	type: 'post' | 'page';
}

export default function AdminBar({ contentId, type }: AdminBarProps) {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [authError, setAuthError] = useState(false);
	const [isDirectusPreview, setIsDirectusPreview] = useState(false);

	const searchParams = useSearchParams();
	const isPreview = searchParams.get('preview') === 'true';

	const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
	const directusLogo = '/images/directus-logo-white.svg';

	const editUrl = contentId ? `${directusUrl}/admin/content/${type}s/${contentId}` : null;
	const newUrl = `${directusUrl}/admin/content/${type}s/+`;

	useEffect(() => {
		if (!isPreview) return;

		if (searchParams.get('directus-preview') === 'true') {
			setIsDirectusPreview(true);

			return;
		}

		const checkAuth = async () => {
			try {
				const response = await fetch('/api/users');
				const data = await response.json();
				setIsAuthenticated(data.isAuthenticated);
			} catch {
				setAuthError(true);
			}
		};

		checkAuth();
	}, [isPreview, searchParams]);

	if (!isPreview || !isAuthenticated || authError || isDirectusPreview) return null;

	return (
		<div className="fixed top-14 left-0 w-full bg-[var(--background-variant-color)] text-white p-3 flex justify-between items-center z-50 shadow-lg">
			<div className="flex items-center gap-3">
				<Image src={directusLogo} alt="Directus Logo" width={167} height={30} className="h-6" />
				<span className="text-sm text-gray-300">Draft Mode Enabled</span>
			</div>

			<div className="flex gap-3">
				{editUrl && (
					<Link
						href={editUrl}
						target="_blank"
						className="bg-[var(--accent-color)] text-white px-4 py-2 rounded-md font-medium transition hover:opacity-85 hover:text-white"
					>
						Edit {type === 'post' ? 'Post' : 'Page'}
					</Link>
				)}
				<Link
					href={newUrl}
					target="_blank"
					className="bg-[var(--accent-color-light)] text-black px-4 py-2 rounded-md font-medium transition hover:opacity-85"
				>
					+ {type === 'post' ? 'New Post' : 'New Page'}
				</Link>
			</div>
		</div>
	);
}
