<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onMount, type Snippet } from 'svelte';
	import { PUBLIC_DIRECTUS_URL } from '$env/static/public';

	interface Props {
		editConfig: {
			collection: string;
			item: string | number | null;
			fields?: string[];
			mode?: 'drawer' | 'modal' | 'popover';
		};
		class?: string;
		children: Snippet;
		[key: string]: any;
	}

	let { editConfig, children, class: className, ...rest }: Props = $props();

	let attr = $state('');
	let el = $state<HTMLElement>();

	onMount(async () => {
		const { apply, setAttr } = await import('@directus/visual-editing');
		attr = setAttr(editConfig);
		// apply({
		// 	directusUrl: PUBLIC_DIRECTUS_URL,
		// 	elements: el

		// });
	});
</script>

<div data-directus={attr} bind:this={el} class={className} {...rest}>
	{@render children()}
</div>
