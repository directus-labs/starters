<script lang="ts">
	import { cn } from '$lib/utils';

	interface TextProps {
		content: string;
		[key: string]: string;
	}

	let { content, ...props }: TextProps = $props();
</script>

<div class={cn('prose dark:prose-invert', props.class)}>
	{@html content}
</div>
