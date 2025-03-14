<script lang="ts">
	import { getDirectusAssetURL } from '$lib/directus/directus-utils';
	import { type DirectusFile } from '$lib/types/directus-schema';

	interface Props {
		uuid: string | DirectusFile;
		width?: number | string;
		height?: number | string;
		alt: string;
		class?: string;
		[key: string]: any;
	}

	let { uuid, width, height, alt, class: className, ...props }: Props = $props();
	let src = $derived(getDirectusAssetURL(uuid));
</script>

<img
	{src}
	{alt}
	{width}
	{height}
	class={className}
	{...props.fill ? { style: 'object-fit: cover; width: 100%; height: 100%;' } : {}}
	{...props.sizes ? { sizes: props.sizes } : {}}
	loading={props.loading || 'lazy'}
	decoding={props.decoding || 'async'}
	{...props}
/>
