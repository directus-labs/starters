'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { apply as applyVisualEditing, setAttr } from '@directus/visual-editing';

interface ApplyOptions {
	elements?: HTMLElement[] | HTMLElement;
	onSaved?: () => void;
	mode?: 'modal' | 'popover' | 'drawer';
}

export function useVisualEditing() {
	const [isVisualEditingEnabled, setIsVisualEditingEnabled] = useState(false);
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();

	const enableVisualEditingEnv = process.env.NEXT_PUBLIC_ENABLE_VISUAL_EDITING === 'true';
	const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || '';

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const param = searchParams.get('visual-editing');

		if (!enableVisualEditingEnv) {
			if (param === 'true') {
				console.warn('Visual editing is not enabled in this environment.');
			}

			return;
		}

		if (param === 'true') {
			localStorage.setItem('visual-editing', 'true');
		} else if (param === 'false') {
			localStorage.removeItem('visual-editing');

			const newParams = new URLSearchParams(searchParams.toString());
			newParams.delete('visual-editing');

			const cleanUrl = pathname + (newParams.toString() ? `?${newParams}` : '');
			window.history.replaceState({}, '', cleanUrl);
		}

		const persisted = localStorage.getItem('visual-editing') === 'true';
		setIsVisualEditingEnabled(persisted);

		if (persisted && param !== 'true') {
			const newParams = new URLSearchParams(searchParams.toString());
			newParams.set('visual-editing', 'true');

			const updatedUrl = pathname + (newParams.toString() ? `?${newParams}` : '');
			window.history.replaceState({}, '', updatedUrl);
		}
	}, [searchParams, pathname, enableVisualEditingEnv]);

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
