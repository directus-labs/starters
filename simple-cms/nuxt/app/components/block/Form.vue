<script setup lang="ts">
import FormBuilder from '~/components/forms/FormBuilder.vue';

interface FormField {
	id: string;
	name?: string;
	type: string;
	label?: string;
	placeholder?: string;
	help?: string;
	required?: boolean;
	choices?: { value: string; text: string }[];
	width?: number;
	sort?: number;
	validation?: string;
}

interface FormData {
	id: string;
	tagline: string | null;
	headline: string | null;
	form: {
		id: string;
		on_success?: 'redirect' | 'message' | null;
		sort?: number | null;
		submit_label?: string;
		success_message?: string | null;
		title?: string | null;
		success_redirect_url?: string | null;
		is_active?: boolean | null;
		fields: FormField[];
	};
}

const props = defineProps<{
	data: FormData;
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
