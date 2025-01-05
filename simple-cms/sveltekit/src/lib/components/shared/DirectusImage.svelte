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

	let imageId = $derived.by(() => {
		if (typeof id === 'string') {
			return id;
		}
		return id.id;
	});

	let { id, width, height, alt, className, ...props }: Props = $props();
	let src = $derived(`${PUBLIC_DIRECTUS_URL}/assets/${imageId}?width=${width}&height=${height}`);
</script>

<img {src} {alt} {width} {height} class={className} />
