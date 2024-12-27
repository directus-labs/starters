'use client';

import { useEffect } from 'react';

type ShortcutCallback = () => void;

const useKeyboardShortcut = (keys: string[], callback: ShortcutCallback) => {
	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			// Normalize for Mac/PC differences
			const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

			const metaKey = isMac ? event.metaKey : event.ctrlKey;
			const keyMatch = keys.includes(event.key);

			// Check if the shortcut matches
			if (metaKey && keyMatch) {
				event.preventDefault();
				callback();
			}
		};

		window.addEventListener('keydown', handler);

		return () => {
			window.removeEventListener('keydown', handler);
		};
	}, [keys, callback]);
};

export default useKeyboardShortcut;
