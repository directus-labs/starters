<script setup lang="ts">
interface ProseProps {
	content: string;
	size?: 'sm' | 'md' | 'lg';
	itemId?: string;
	collection?: string;
}
withDefaults(defineProps<ProseProps>(), {
	size: 'md',
});
const contentEl = ref<HTMLElement | null>(null);

onMounted(() => {
	const config = useRuntimeConfig();
	if (!contentEl.value) return;

	const anchors = Array.from(contentEl.value.getElementsByTagName('a'));

	for (const anchor of anchors) {
		const href = anchor.getAttribute('href');
		if (!href) continue;

		const url = new URL(href, window.location.origin);
		const isLocal = url.hostname === config.public.siteUrl;

		if (isLocal) {
			anchor.addEventListener('click', (e) => {
				e.preventDefault();
				navigateTo({
					path: url.pathname,
					hash: url.hash,
					query: Object.fromEntries(url.searchParams.entries()),
				});
			});
		} else {
			anchor.setAttribute('target', '_blank');
			anchor.setAttribute('rel', 'noopener noreferrer');
		}
	}
});
</script>

<template>
	<div
		ref="contentEl"
		:class="[
			{
				'prose-sm': size === 'sm',
				'md:prose-base lg:prose-lg': size === 'md',
				'prose-lg lg:prose-xl': size === 'lg',
			},
			'prose dark:prose-invert text-foreground prose-img:rounded-lg prose-img:border-2 prose-img:border-gray-500 prose-headings:font-display',
		]"
		v-html="content"
	/>
</template>
