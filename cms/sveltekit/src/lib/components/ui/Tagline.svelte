<script lang="ts">
	interface TitleProps {
		tagline?: string | null;
		class?: string;
		as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
		'data-directus'?: string;
	}

	const {
		tagline,
		class: className = '',
		as = 'p',
		'data-directus': dataDirectus
	}: TitleProps = $props();
</script>

{#if tagline}
	<svelte:element
		this={as}
		class={`font-heading text-lg font-normal uppercase text-accent md:text-xl lg:text-tagline ${className}`}
		data-directus={dataDirectus}
	>
		{tagline}
	</svelte:element>
{/if}
