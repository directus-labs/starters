<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(async () => {
	const config = useRuntimeConfig().public;

	if (!config.enableVisualEditing) return;

	try {
		const { apply } = await import('@directus/visual-editing');

		await apply({
			directusUrl: config.directusUrl,
			onSaved(updateData) {
				window.dispatchEvent(
					new CustomEvent('directus:update', {
						detail: updateData,
					}),
				);
			},
		});
	} catch (err) {
		console.error('[DirectusVisualEditing] Failed to apply():', err);
	}
});
</script>

<template>
	<slot />
</template>
