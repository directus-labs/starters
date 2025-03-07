<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Copy, Share } from 'lucide-svelte';
	import Button from './button/button.svelte';
	import { Label } from './label';
	import { Input } from './input';

	let copied = $state(false);

	let { postUrl, postTitle }: { postUrl: string; postTitle: string } = $props();
	const handleCopy = () => {
		navigator.clipboard.writeText(postUrl);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	};

	const socialLinks = $derived([
		{
			service: 'reddit',
			url: `http://www.reddit.com/submit?url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(postTitle)}`,
			icon: '/icons/social/reddit.svg'
		},
		{
			service: 'x',
			url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(postTitle)}`,
			icon: '/icons/social/twitter.svg'
		},
		{
			service: 'linkedin',
			url: `https://www.linkedin.com/shareArticle/?mini=true&url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(postTitle)}`,
			icon: '/icons/social/linkedin.svg'
		}
	]);
</script>

<Dialog.Root>
	<Dialog.Trigger>
		<Button variant="outline" class="flex items-center space-x-2">
			<Share class="size-4" />
			<span>Share Blog</span>
		</Button>
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Share this blog post</Dialog.Title>
		</Dialog.Header>
		<div class="mb-1 flex justify-center space-x-4">
			{#each socialLinks as social (social.service)}
				<a
					href={social.url}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center justify-center rounded bg-transparent transition-colors hover:opacity-70"
				>
					<img
						src={social.icon}
						alt={`${social.service} icon`}
						width={32}
						height={32}
						class="size-8 dark:invert"
					/>
				</a>
			{/each}
		</div>
		<div class="flex items-center space-x-2">
			<div class="grid flex-1 gap-2">
				<Label for="link" class="sr-only">Link</Label>
				<Input id="link" value={postUrl} readonly />
			</div>
			<Button type="button" size="sm" class="px-3" onclick={handleCopy}>
				<span class="sr-only">Copy</span>
				<Copy />
			</Button>
		</div>
		{#if copied}
			<p class="mt-2 text-sm text-green-600">Link copied to clipboard!</p>
		{/if}
		<Dialog.Footer class="sm:justify-start">
			<Dialog.Close>
				<Button type="button" variant="secondary">Close</Button>
			</Dialog.Close>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
