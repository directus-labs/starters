'use client';

import { useEffect } from 'react';
// This component is used to initialize the visual editing library as it is a calient side library
export default function DirectusVisualEditing() {
	useEffect(() => {
		// Dynamically import the visual editing library only on the client
		const loadVisualEditing = async () => {
			try {
				//TO DO:Temporary local package, replace with npm package when ready
				const { apply } = await import('../../../node_modules/@directus/visual-editing/dist/index.js');

				await apply({
					directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
				});
			} catch (error) {
				console.error('Error initializing Directus Visual Editor:', error);
			}
		};

		loadVisualEditing();
	}, []);

	return null;
}
