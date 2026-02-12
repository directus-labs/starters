<script lang="ts">
	import { PUBLIC_DIRECTUS_URL } from '$env/static/public';
	import { afterNavigate, invalidateAll } from '$app/navigation';
	import { enableVisualEditing } from '$lib/directus/visualEditing';
	import { apply } from '@directus/visual-editing';

	const { children } = $props();

	enableVisualEditing();

	afterNavigate(async (_navigation) => {
		// First apply: all [data-directus] elements get overlays
		await apply({
			directusUrl: PUBLIC_DIRECTUS_URL,
			onSaved: async () => {
				await invalidateAll();
			}
		});
		// Second apply: add customClass to the Edit All Blocks overlay so the hide rule can target it
		const editButton = document.querySelector('#visual-editing-button');
		if (editButton) {
			await apply({
				directusUrl: PUBLIC_DIRECTUS_URL,
				elements: editButton as HTMLElement,
				customClass: 'visual-editing-button-class',
				onSaved: async () => {
					await invalidateAll();
				}
			});
		}
	});
</script>

{@render children()}
