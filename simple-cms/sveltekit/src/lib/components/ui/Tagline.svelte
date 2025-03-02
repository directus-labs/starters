<script lang="ts">
	interface TitleProps {
		tagline?: string | null;
		class?: string;
		as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
	}

	const { tagline, class: className, as: Component = 'p' }: TitleProps = $props();
</script>

{#if tagline}
	<svelte:element
		this={Component}
		class={`font-heading font-normal uppercase text-accent ${className}
         lg:text-tagline text-lg md:text-xl`}
	>
		{tagline}
	</svelte:element>
{/if}
