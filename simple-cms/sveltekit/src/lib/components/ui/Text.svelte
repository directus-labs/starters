<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		content: string;
		[key: string]: string;
	}

	let { content, ...props }: Props = $props();
</script>

<div class={cn('prose dark:prose-invert', props.class)}>
	{@html content}
</div>
