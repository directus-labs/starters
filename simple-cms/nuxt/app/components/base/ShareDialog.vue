<script setup lang="ts">
import { ref } from 'vue';
import { Copy, Share } from 'lucide-vue-next';
import { Button } from '~/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

defineProps<{ postUrl: string; postTitle: string }>();

const copied = ref(false);

const handleCopy = (postUrl: string) => {
	navigator.clipboard.writeText(postUrl);
	copied.value = true;
	setTimeout(() => (copied.value = false), 2000);
};

const socialLinks = [
	{
		service: 'reddit',
		getUrl: (postUrl: string, postTitle: string) =>
			`http://www.reddit.com/submit?url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(postTitle)}`,
		icon: '/icons/social/reddit.svg',
	},
	{
		service: 'x',
		getUrl: (postUrl: string, postTitle: string) =>
			`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(postTitle)}`,
		icon: '/icons/social/twitter.svg',
	},
	{
		service: 'linkedin',
		getUrl: (postUrl: string, postTitle: string) =>
			`https://www.linkedin.com/shareArticle/?mini=true&url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(postTitle)}`,
		icon: '/icons/social/linkedin.svg',
	},
];
</script>

<template>
	<Dialog>
		<DialogTrigger asChild>
			<Button variant="outline" class="flex items-center space-x-2">
				<Share class="size-4" />
				<span>Share Blog</span>
			</Button>
		</DialogTrigger>
		<DialogContent class="sm:max-w-md">
			<DialogHeader>
				<DialogTitle>Share this blog post</DialogTitle>
			</DialogHeader>
			<div class="flex justify-center space-x-4 mb-1">
				<a
					v-for="social in socialLinks"
					:key="social.service"
					:href="social.getUrl(postUrl, postTitle)"
					target="_blank"
					rel="noopener noreferrer"
					class="rounded bg-transparent inline-flex items-center justify-center transition-colors hover:opacity-70"
				>
					<img :src="social.icon" :alt="`${social.service} icon`" width="32" height="32" class="size-8 dark:invert" />
				</a>
			</div>
			<div class="flex items-center space-x-2">
				<div class="grid flex-1 gap-2">
					<Label for="link" class="sr-only">Link</Label>
					<Input id="link" :value="postUrl" readonly />
				</div>
				<Button type="button" size="sm" class="px-3" @click="handleCopy(postUrl)">
					<span class="sr-only">Copy</span>
					<Copy />
				</Button>
			</div>
			<p v-if="copied" class="mt-2 text-sm text-green-600">Link copied to clipboard!</p>
			<DialogFooter class="sm:justify-start">
				<DialogClose asChild>
					<Button type="button" variant="secondary">Close</Button>
				</DialogClose>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
