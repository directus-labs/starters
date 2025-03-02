<script lang="ts">
	import { getDirectusAssetURL } from '$lib/directus/directus-utils';
	import { type DirectusFile } from '$lib/types/directus-schema';

	interface Props {
		id: string | DirectusFile;
		width?: number | string;
		height?: number | string;
		alt: string;
		className?: string;
		[key: string]: any;
	}

	let { id, width, height, alt, className, ...props }: Props = $props();
	let src = $derived(getDirectusAssetURL(id));
</script>

<!-- {width}
{height} -->
<img {src} {alt} {width} {height} class={className} />
