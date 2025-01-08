<script lang="ts">
	import { PUBLIC_DIRECTUS_URL } from '$env/static/public';
	import type { DirectusFile } from '@directus/sdk';

	interface Props {
		id: string | DirectusFile;
		width?: number | string;
		height?: number | string;
		alt: string;
		className?: string;
		[key: string]: any;
	}

	let { id, width, height, alt, className, ...props }: Props = $props();
	let imageId = $derived.by(() => {
		if (typeof id === 'string') {
			return id;
		}
		return id.id;
	});
	//width=${width}&height=${height}
	let src = $derived(`${PUBLIC_DIRECTUS_URL}/assets/${imageId}`);
</script>

<!-- {width}
{height} -->
<img {src} {alt} class={className} />
