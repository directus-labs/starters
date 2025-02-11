<script setup lang="ts">
import FormBuilder from '~/components/forms/FormBuilder.vue';

interface FormData {
	id: string;
	tagline: string | null;
	headline: string | null;
	form: Form;
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
