<script setup lang="ts">
import Text from '~/components/base/Text.vue';

interface RichTextProps {
	data: {
		id?: string;
		tagline?: string;
		headline?: string;
		content?: string;
		alignment?: 'left' | 'center' | 'right';
		className?: string;
	};
}

withDefaults(defineProps<RichTextProps>(), {
	data: () => ({
		alignment: 'left',
	}),
});

const { setAttr } = useVisualEditing();
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
			data.className,
		]"
	>
		<Tagline
			v-if="data.tagline"
			:tagline="data.tagline"
			:data-directus="
				setAttr({
					collection: 'block_richtext',
					item: data.id,
					fields: 'tagline',
					mode: 'popover',
				})
			"
		/>
		<Headline
			v-if="data.headline"
			:headline="data.headline"
			:data-directus="
				setAttr({
					collection: 'block_richtext',
					item: data.id,
					fields: 'headline',
					mode: 'popover',
				})
			"
		/>
		<Text
			v-if="data.content"
			:content="data.content"
			:data-directus="
				setAttr({
					collection: 'block_richtext',
					item: data.id,
					fields: 'content',
					mode: 'drawer',
				})
			"
		/>
	</div>
</template>
