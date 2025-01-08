<script lang="ts">
	interface Props {
		headline?: string | null;
		as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
		[key: string]: any;
	}

	let { headline, as = 'p', ...props }: Props = $props();
</script>

{#if headline}
	<as
		class="font-heading font-normal text-foreground {props.class}
         lg:text-headline text-4xl md:text-5xl">{headline}</as
	>
{/if}
