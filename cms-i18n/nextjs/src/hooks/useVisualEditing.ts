'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { apply as applyVisualEditing } from '@directus/visual-editing';
import { setAttr, setVisualEditingAttrsEnabled } from '@/lib/directus/visualEditing';

interface ApplyOptions {
	elements?: HTMLElement[] | HTMLElement;
	onSaved?: () => void;
	mode?: 'modal' | 'popover' | 'drawer';
}

export function useVisualEditing() {
	const [isVisualEditingEnabled, setIsVisualEditingEnabled] = useState(false);
	const searchParams = useSearchParams();
	const pathname = usePathname();

	// Enabled by default; set to 'false' to disable
	const enableVisualEditingEnv = process.env.NEXT_PUBLIC_ENABLE_VISUAL_EDITING !== 'false';
	const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || '';

	const readPersistedVisualEditing = () => {
		try {
			return localStorage.getItem('visual-editing') === 'true';
		} catch {
			return false;
		}
	};

	const writePersistedVisualEditing = (enabled: boolean) => {
		try {
			if (enabled) {
				localStorage.setItem('visual-editing', 'true');
			} else {
				localStorage.removeItem('visual-editing');
			}
		} catch {
			// Storage can be unavailable in restrictive browser contexts.
		}
	};

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const param = searchParams.get('visual-editing');
		// Enable when Directus sends ?preview=true (live preview tab) even without
		// ?visual-editing=true — both indicate an admin-controlled iframe.
		const isPreview = searchParams.get('preview') === 'true';

		if (!enableVisualEditingEnv) {
			setVisualEditingAttrsEnabled(false);
			setIsVisualEditingEnabled(false);

			if (param === 'true') {
				console.warn('Visual editing is not enabled in this environment.');
			}

			return;
		}

		if (param === 'true') {
			writePersistedVisualEditing(true);
		} else if (param === 'false') {
			writePersistedVisualEditing(false);

			const newParams = new URLSearchParams(searchParams.toString());
			newParams.delete('visual-editing');

			const cleanUrl = pathname + (newParams.toString() ? `?${newParams}` : '');
			window.history.replaceState({}, '', cleanUrl);
		}

		const persisted = readPersistedVisualEditing();
		const shouldEnable = persisted || isPreview;
		setVisualEditingAttrsEnabled(shouldEnable);
		setIsVisualEditingEnabled(shouldEnable);

		if (shouldEnable && param !== 'true') {
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
