<script lang="ts">
	interface TitleProps {
		title?: string | null;
		class?: string;
		as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
	}

	let { title, as = 'h2', ...props }: TitleProps = $props();
</script>

{#if title}
	<as
		class="font-heading font-normal uppercase text-accent {props.class}
         lg:text-title text-lg md:text-xl"
	>
		{title}
	</as>
{/if}
