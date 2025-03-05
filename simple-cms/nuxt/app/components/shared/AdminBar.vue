<script setup lang="ts">
const { showAdminBar, adminBarState, editUrl, newUrl, collectionLabel, collectionUrl } = useAdminBar();
</script>

<template>
	<div v-if="showAdminBar" class="z-50 admin-bar">
		<Container class="w-full flex justify-between items-center py-2">
			<div class="logo-container">
				<!-- <img :src="directusLogo" alt="Directus Logo" class="logo" /> -->
				<NuxtLink :to="collectionUrl" class="font-mono" target="_blank">{{ adminBarState.collection }}</NuxtLink>
				<span class="font-mono">/</span>
				<span class="draft-mode-text">{{ adminBarState.title }}</span>
			</div>
			<div class="buttons">
				<BaseButton v-if="editUrl" id="edit-button" :url="editUrl" target="_blank" variant="default" size="sm">
					Edit {{ collectionLabel }}
				</BaseButton>
				<BaseButton v-if="newUrl" id="new-button" :url="newUrl" target="_blank" size="sm">
					New {{ collectionLabel }}
				</BaseButton>
			</div>
		</Container>
	</div>
</template>

<style scoped>
.admin-bar {
	position: sticky;
	top: 0;
	background: var(--background-variant-color);
	color: white;
	z-index: 9999;
}

.logo-container {
	display: flex;
	align-items: center;
	gap: 10px;
}

.logo {
	height: 24px;
}

.draft-mode-text {
	font-size: 14px;
	color: #ddd;
}

.buttons {
	display: flex;
	gap: 10px;
}

.edit-button {
	background: var(--accent-color);
	color: white;
	padding: 8px 16px;
	border-radius: 4px;
	text-decoration: none;
	font-weight: 500;
}

.new-button {
	background: var(--accent-color-light);
	color: black;
	padding: 8px 16px;
	border-radius: 4px;
	text-decoration: none;
	font-weight: 500;
}

.edit-button:hover,
.new-button:hover {
	opacity: 0.85;
}
</style>
