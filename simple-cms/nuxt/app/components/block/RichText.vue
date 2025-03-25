<script setup lang="ts">
import { setAttr } from '@directus/visual-editing';
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

const props = withDefaults(defineProps<RichTextProps>(), {
	data: () => ({
		alignment: 'left',
	}),
});

const { id, tagline, headline, content, alignment, className } = props.data;
</script>

<template>
	<div
		:class="[
			'mx-auto max-w-[600px] space-y-6',
			{
				'text-center': alignment === 'center',
				'text-right': alignment === 'right',
				'text-left': alignment === 'left',
			},
			className,
		]"
	>
		<Tagline
			v-if="tagline"
			:tagline="tagline"
			v-bind="
				id
					? { 'data-directus': setAttr({ collection: 'block_richtext', item: id, fields: 'tagline', mode: 'popover' }) }
					: {}
			"
		/>
		<Headline
			v-if="headline"
			:headline="headline"
			v-bind="
				id
					? {
							'data-directus': setAttr({ collection: 'block_richtext', item: id, fields: 'headline', mode: 'popover' }),
						}
					: {}
			"
		/>
		<Text
			v-if="content"
			:content="content"
			v-bind="
				id
					? { 'data-directus': setAttr({ collection: 'block_richtext', item: id, fields: 'content', mode: 'popover' }) }
					: {}
			"
		/>
	</div>
</template>
