<script setup lang="ts">
import { setAttr } from '@directus/visual-editing';

interface CustomFormData {
	id: string;
	tagline: string | null;
	headline: string | null;
	form: CustomForm;
}
interface CustomForm {
	id: string;
	on_success?: 'redirect' | 'message' | null;
	sort?: number | null;
	submit_label?: string | null;
	success_message?: string | null;
	title?: string | null;
	success_redirect_url?: string | null;
	is_active?: boolean | null;
	fields: FormField[];
}

const props = defineProps<{ data: CustomFormData }>();

const { id, tagline, headline, form } = props.data;
</script>

<template>
	<section
		v-if="form"
		class="mx-auto"
		v-bind="
			id
				? {
						'data-directus': setAttr({
							collection: 'block_form',
							item: id,
							fields: ['tagline', 'headline', 'form'],
							mode: 'drawer',
						}),
					}
				: {}
		"
	>
		<Tagline
			v-if="tagline"
			:tagline="tagline"
			v-bind="
				id
					? { 'data-directus': setAttr({ collection: 'block_form', item: id, fields: 'tagline', mode: 'popover' }) }
					: {}
			"
		/>

		<Headline
			v-if="headline"
			:headline="headline"
			v-bind="
				id
					? { 'data-directus': setAttr({ collection: 'block_form', item: id, fields: 'headline', mode: 'popover' }) }
					: {}
			"
		/>

		<div
			v-bind="
				form?.id
					? {
							'data-directus': setAttr({
								collection: 'forms',
								item: form.id,
								fields: ['title', 'submit_label', 'success_message', 'success_redirect_url', 'on_success'],
								mode: 'drawer',
							}),
						}
					: {}
			"
		>
			<FormBuilder :form="form" class="mt-8" />
		</div>
	</section>
</template>
