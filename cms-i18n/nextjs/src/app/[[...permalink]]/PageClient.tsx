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

interface VisualEditingOptions {
	customClass?: string;
	onSaved?: () => void;
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
			} as VisualEditingOptions);

			apply({
				elements: document.querySelector('#visual-editing-button') as HTMLElement,
				customClass: 'visual-editing-button-class',
				onSaved: () => {
					router.refresh();
				},
			} as VisualEditingOptions);
		}
	}, [isVisualEditingEnabled, apply, router]);

	return (
		<div className="relative">
			<PageBuilder sections={sections} />
			{isVisualEditingEnabled && pageId && (
				<div className="fixed z-50 w-full bottom-4 inset-x-0 p-4 flex justify-center items-center gap-2">
					{/* If you're not using the visual editor it's safe to remove this element. Just a helper to let editors add edit / add new blocks to a page. */}
					<Button
						id="visual-editing-button"
						variant="secondary"
						className="visual-editing-button-class"
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
			<style jsx global>{`
				/* Safe to remove this if you're not using the visual editor. */
				.directus-visual-editing-overlay.visual-editing-button-class .directus-visual-editing-edit-button {
					position: absolute;
					inset: 0;
					width: 100%;
					height: 100%;
					transform: none;
					background: transparent;
				}
			`}</style>
		</div>
	);
}
