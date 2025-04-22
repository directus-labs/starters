<script lang="ts">
	import { cn } from '$lib/utils';

	interface TextProps {
		content: string;
		class?: string;
		'data-directus'?: string | undefined;
	}

	let { content, 'data-directus': dataDirectus, ...props }: TextProps = $props();
</script>

<div class={cn('prose dark:prose-invert', props.class)} data-directus={dataDirectus}>
	{@html content}
</div>
