<script lang="ts">
	import setAttr from '$lib/directus/visualEditing';
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
		<Tagline
			{tagline}
			data-directus={setAttr({
				collection: 'block_form',
				item: data.id,
				fields: 'tagline',
				mode: 'popover'
			})}
		/>
	{/if}
	{#if headline}
		<Headline
			{headline}
			data-directus={setAttr({
				collection: 'block_form',
				item: data.id,
				fields: 'headline',
				mode: 'popover'
			})}
		/>
	{/if}
	<div
		data-directus={setAttr({
			collection: 'block_form',
			item: data.id,
			fields: ['form'],
			mode: 'popover'
		})}
	>
		<FormBuilder {form} class="mt-8" />
	</div>
</section>
