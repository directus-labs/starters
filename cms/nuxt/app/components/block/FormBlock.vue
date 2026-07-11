<script setup lang="ts">
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

defineProps<{ data: CustomFormData }>();
const { setBlockAttr } = useVisualEditingAttrs();
</script>

<template>
	<section v-if="data.form" class="mx-auto">
		<Tagline
			v-if="data.tagline"
			:tagline="data.tagline"
			:data-directus="
				setBlockAttr({
					blockCollection: 'block_form',
					blockItemId: data.id,
					fields: 'tagline',
					mode: 'popover',
				})
			"
		/>

		<Headline
			v-if="data.headline"
			:headline="data.headline"
			:data-directus="
				setBlockAttr({
					blockCollection: 'block_form',
					blockItemId: data.id,
					fields: 'headline',
					mode: 'popover',
				})
			"
		/>

		<div
			:data-directus="
				setBlockAttr({
					blockCollection: 'block_form',
					blockItemId: data.id,
					fields: ['form'],
					mode: 'popover',
				})
			"
		>
			<FormBuilder :form="data.form" :block-form-id="data.id" class="mt-8" />
		</div>
	</section>
</template>
