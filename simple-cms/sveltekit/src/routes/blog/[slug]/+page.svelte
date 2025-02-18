<script lang="ts">
	import { page } from '$app/state';
	import { PUBLIC_SITE_URL } from '$env/static/public';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let post = $derived(data.post);
	const authorName = $derived(
		[post?.author?.first_name, post?.author?.last_name].filter(Boolean).join(' ')
	);
	const postUrl = `${PUBLIC_SITE_URL}/blog/${page.params.slug}`;
</script>
