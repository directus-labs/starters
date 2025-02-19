<script setup lang="ts">
interface RichTextProps {
	data: {
		tagline?: string;
		headline?: string;
		content?: string;
		alignment?: 'left' | 'center' | 'right';
		className?: string;
	};
}

const props = withDefaults(defineProps<RichTextProps>(), {
	data: () => ({
		alignment: 'left',
	}),
});
</script>

<template>
	<div
		:class="[
			'mx-auto max-w-[600px] space-y-6',
			{
				'text-center': data.alignment === 'center',
				'text-right': data.alignment === 'right',
				'text-left': data.alignment === 'left',
			},
			props.data.className,
		]"
	>
		<Tagline v-if="data.tagline" :tagline="data.tagline" />
		<Headline v-if="data.headline" :headline="data.headline" />
		<Text v-if="data.content" :content="data.content" />
	</div>
</template>
