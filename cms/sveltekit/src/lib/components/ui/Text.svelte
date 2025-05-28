<script lang="ts">
	import { cn } from '$lib/utils';

	interface TextProps {
		content: string;
		class?: string;
		'data-directus'?: string | undefined;
	}

	let { content, 'data-directus': dataDirectus, ...props }: TextProps = $props();
</script>

<div
	class={cn(
		'prose dark:prose-invert text-foreground prose-img:rounded-lg prose-img:border-2 prose-img:border-gray-500 prose-headings:font-display',
		props.class
	)}
	data-directus={dataDirectus}
>
	{@html content}
</div>
