<script setup lang="ts">
import { ref } from 'vue';
import { Share, Copy } from 'lucide-vue-next';

interface ShareDialogProps {
	postUrl: string;
	postTitle: string;
}

const props = defineProps<ShareDialogProps>();

const copied = ref(false);
const isOpen = ref(false);

const socialLinks = [
	{
		service: 'reddit',
		url: `http://www.reddit.com/submit?url=${encodeURIComponent(props.postUrl)}&title=${encodeURIComponent(props.postTitle)}`,
		icon: '/icons/social/reddit.svg',
	},
	{
		service: 'x',
		url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(props.postUrl)}&text=${encodeURIComponent(props.postTitle)}`,
		icon: '/icons/social/twitter.svg',
	},
	{
		service: 'linkedin',
		url: `https://www.linkedin.com/shareArticle/?mini=true&url=${encodeURIComponent(props.postUrl)}&title=${encodeURIComponent(props.postTitle)}`,
		icon: '/icons/social/linkedin.svg',
	},
];

const handleCopy = () => {
	navigator.clipboard.writeText(props.postUrl);
	copied.value = true;
	setTimeout(() => {
		copied.value = false;
	}, 2000);
};
</script>

<template>
	<div>
		<Button variant="outline" class="flex items-center space-x-2" @click="isOpen = true">
			<Share class="w-4 h-4" />
			<span>Share Blog</span>
		</Button>

		<ClientOnly>
			<teleport to="body">
				<div
					v-if="isOpen"
					class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
					@click.self="isOpen = false"
				>
					<div class="bg-white rounded-lg p-6 w-full max-w-md">
						<div class="flex justify-between items-center mb-4">
							<h2 class="text-xl font-bold">Share this blog post</h2>
							<button class="text-gray-500 hover:text-gray-700" @click="isOpen = false">✕</button>
						</div>

						<div class="flex justify-center space-x-4 mb-4">
							<a
								v-for="social in socialLinks"
								:key="social.service"
								:href="social.url"
								target="_blank"
								rel="noopener noreferrer"
								class="hover:opacity-70"
							>
								<img :src="social.icon" :alt="`${social.service} icon`" class="w-8 h-8 dark:invert" />
							</a>
						</div>

						<div class="flex items-center space-x-2 mb-4">
							<input type="text" :value="postUrl" readonly class="flex-1 p-2 border rounded" />
							<Button @click="handleCopy">
								<Copy class="w-4 h-4 mr-2" />
								Copy
							</Button>
						</div>

						<p v-if="copied" class="text-green-600 text-sm">Link copied to clipboard!</p>
					</div>
				</div>
			</teleport>
		</ClientOnly>
	</div>
</template>
