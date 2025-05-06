'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageBuilder from '@/components/layout/PageBuilder';
import { useVisualEditing } from '@/hooks/useVisualEditing';
import { PageBlock } from '@/types/directus-schema';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { setAttr } from '@directus/visual-editing';

interface PageClientProps {
	sections: PageBlock[];
	pageId?: string;
}

export default function PageClient({ sections, pageId }: PageClientProps) {
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
		<div className="relative">
			<PageBuilder sections={sections} />
			{isVisualEditingEnabled && pageId && (
				<div className="fixed z-50 w-full bottom-4 inset-x-0 p-4 flex justify-center items-center gap-2">
					<Button
						id="visual-editing-button"
						variant="secondary"
						data-directus={setAttr({
							collection: 'pages',
							item: pageId,
							fields: ['blocks', 'meta_m2a_button'],
							mode: 'modal',
						})}
					>
						<Pencil className="size-4 mr-2" />
						Edit All Blocks
					</Button>
				</div>
			)}
		</div>
	);
}
