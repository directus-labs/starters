'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { apply as applyVisualEditing, setAttr } from '@directus/visual-editing';

interface ApplyOptions {
	directusUrl: string;
	elements?: HTMLElement[] | HTMLElement;
	onSaved?: () => void;
	mode?: 'modal' | 'popover' | 'drawer';
}

export function useVisualEditing() {
	const [isVisualEditingEnabled, setIsVisualEditingEnabled] = useState(false);
	const searchParams = useSearchParams();

	const enableVisualEditing = process.env.NEXT_PUBLIC_ENABLE_VISUAL_EDITING === 'true';
	const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || '';

	// Check the URL query parameter on mount and when it changes.
	useEffect(() => {
		const visualEditingParam = searchParams.get('visual-editing');
		if (visualEditingParam === 'true' && enableVisualEditing) {
			setIsVisualEditingEnabled(true);
		} else if (visualEditingParam === 'false') {
			setIsVisualEditingEnabled(false);
		}
	}, [searchParams, enableVisualEditing]);

	// Only apply visual editing if it's enabled.
	const apply = (options: Pick<ApplyOptions, 'elements' | 'onSaved' | 'mode'>) => {
		if (!isVisualEditingEnabled) return;
		applyVisualEditing({
			...options,
			directusUrl,
		});
	};

	return {
		isVisualEditingEnabled,
		apply,
		setAttr,
	};
}
