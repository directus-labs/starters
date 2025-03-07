<script lang="ts">
	interface TitleProps {
		tagline?: string | null;
		class?: string;
		as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
	}

	const { tagline, class: className = '', as = 'p' }: TitleProps = $props();
</script>

{#if tagline}
	<svelte:element
		this={as}
		class={`font-heading lg:text-tagline text-lg font-normal uppercase text-accent md:text-xl ${className}`}
	>
		{tagline}
	</svelte:element>
{/if}
