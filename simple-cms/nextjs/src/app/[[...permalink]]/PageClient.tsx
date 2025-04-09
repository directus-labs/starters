'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageBuilder from '@/components/layout/PageBuilder';
import { useVisualEditing } from '@/hooks/useVisualEditing';
import { PageBlock } from '@/types/directus-schema';

interface PageClientProps {
	sections: PageBlock[];
}

export default function PageClient({ sections }: PageClientProps) {
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

	return <PageBuilder sections={sections} />;
}
