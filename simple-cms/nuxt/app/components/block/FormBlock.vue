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

const props = defineProps<{
	data: CustomFormData;
}>();

const { tagline, headline, form } = props.data;
</script>

<template>
	<section v-if="form" class="mx-auto">
		<Tagline v-if="tagline" :tagline="tagline" />
		<Headline v-if="headline" :headline="headline" />
		<FormBuilder :form="form" class="mt-8" />
	</section>
</template>
