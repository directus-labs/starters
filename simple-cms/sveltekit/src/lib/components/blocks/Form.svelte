<script lang="ts">
	import type { FormField } from '$lib/types/directus-schema';
	import FormBuilder from '../forms/FormBuilder.svelte';
	import Headline from '../ui/Headline.svelte';
	import Tagline from '../ui/Tagline.svelte';

	interface FormBlockProps {
		data: {
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
		};
	}

	const { data }: FormBlockProps = $props();
	const { tagline, headline, form } = $derived(data);
</script>

<section class="mx-auto">
	{#if tagline}
		<Tagline {tagline} />
	{/if}
	{#if headline}
		<Headline {headline} />
	{/if}
	<FormBuilder {form} class="mt-8" />
</section>
