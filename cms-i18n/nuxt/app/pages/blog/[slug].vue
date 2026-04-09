<script setup lang="ts">
import type { Post, DirectusUser } from '#shared/types/schema';
import type { SiteData } from '#shared/types/site-data';
import { localizeLink, addLocaleToPath, getNotFoundMessage } from '~/lib/i18n/utils';
import { DEFAULT_LOCALE } from '~/lib/i18n/config';
import { firstQueryValue, isPreviewQueryValue, normalizeVersionQuery } from '~/utils/preview-query';

const route = useRoute();
const { enabled } = useLivePreview();
const previewActive = computed(() => isPreviewQueryValue(route.query.preview) || enabled.value);
const { isVisualEditingEnabled, apply, setAttr } = useVisualEditing();
const runtimeConfig = useRuntimeConfig();

const slug = route.params.slug as string;

// Get locale from composable (handles SSR URL rewrite correctly)
const { currentLocale } = useLocale();
const locale = currentLocale.value;

// Helper to localize internal paths using shared utility
const localize = (path: string | null | undefined) => localizeLink(path, locale);

const wrapperRef = ref<HTMLElement | null>(null);

const {
	public: { siteUrl },
} = runtimeConfig;

const { data, error, refresh } = await useFetch<{
	post: Post;
	relatedPosts: Post[];
}>(() => `/api/posts/${slug}`, {
	key: computed(
		() =>
			`posts-${slug}-${locale}-${normalizeVersionQuery(route.query.version) ?? ''}-${firstQueryValue(route.query.id) ?? ''}-${previewActive.value ? 'p' : '0'}`,
	),
	headers: {
		'x-locale': locale,
	},
	query: computed(() => ({
		preview: previewActive.value ? true : undefined,
		id: firstQueryValue(route.query.id),
		version: normalizeVersionQuery(route.query.version),
		locale,
	})),
});

if (!data.value || error.value) {
	throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true });
}

const post = computed(() => data.value?.post);
const relatedPosts = computed(() => data.value?.relatedPosts);
const author = computed(() => post.value?.author as Partial<DirectusUser>);

// Reuse site data (locales) from layout to avoid refetching
const siteDataState = useState<SiteData | null>('site-data');
const supportedLocales = computed(() => siteDataState.value?.supportedLocales || [DEFAULT_LOCALE]);

// Build alternate language URLs
const blogPath = `/blog/${slug}`;
const localizedPath = addLocaleToPath(blogPath, locale);
const postUrl = `${siteUrl}${localizedPath}`;

// Build alternates for all supported locales once
const alternateLanguages: Record<string, string> = (() => {
	const alternates: Record<string, string> = {};

	for (const altLocale of supportedLocales.value) {
		const altPath = addLocaleToPath(blogPath, altLocale);
		alternates[altLocale] = `${siteUrl}${altPath}`;
	}

	return alternates;
})();

onMounted(() => {
	if (!isVisualEditingEnabled.value) return;
	apply({
		onSaved: () => refresh(),
	});
});

useSeoMeta({
	title: post.value?.seo?.title || post.value?.title,
	description: post.value?.seo?.meta_description || post.value?.description,
	ogTitle: post.value?.seo?.title || post.value?.title,
	ogDescription: post.value?.seo?.meta_description || post.value?.description,
	ogUrl: postUrl,
	ogLocale: locale,
});

// Set alternate language links via useHead
useHead({
	link: Object.entries(alternateLanguages).map(([lang, href]) => ({
		rel: 'alternate',
		hreflang: lang,
		href,
	})),
});

const notFoundMessage = computed(() => getNotFoundMessage(locale, 'post'));
</script>
<template>
	<div v-if="post" ref="wrapperRef">
		<Container class="py-12">
			<div v-if="post.image" class="mb-8 w-full">
				<div
					class="relative w-full h-[400px] overflow-hidden rounded-lg"
					:data-directus="
						setAttr({ collection: 'posts', item: post.id, fields: ['image', 'meta_header_image'], mode: 'modal' })
					"
				>
					<DirectusImage
						:uuid="post.image as string"
						:alt="post.title || 'post header image'"
						class="object-cover w-full h-full"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
						fill
					/>
				</div>
			</div>

			<Headline
				:headline="post.title"
				as="h2"
				class="!text-accent mb-4"
				:data-directus="setAttr({ collection: 'posts', item: post.id, fields: ['title', 'slug'], mode: 'popover' })"
			/>

			<Separator class="h-[1px] bg-gray-300 my-8" />

			<div class="grid grid-cols-1 lg:grid-cols-[minmax(0,_2fr)_400px] gap-12">
				<main class="text-left">
					<Text
						:content="post.content || ''"
						:data-directus="
							setAttr({
								collection: 'posts',
								item: post.id,
								fields: ['content', 'meta_header_content'],
								mode: 'drawer',
							})
						"
					/>
				</main>

				<aside class="space-y-6 p-6 rounded-lg max-w-[496px] h-fit bg-background-muted">
					<div
						v-if="author"
						class="flex items-center space-x-4"
						:data-directus="setAttr({ collection: 'posts', item: post.id, fields: 'author', mode: 'popover' })"
					>
						<DirectusImage
							v-if="author?.avatar"
							:uuid="author?.avatar"
							:alt="userName(author)"
							class="rounded-full object-cover size-[48px]"
							:width="48"
							:height="48"
						/>

						<p v-if="author" class="font-bold">{{ userName(author) }}</p>
					</div>

					<p
						v-if="post.description"
						:data-directus="setAttr({ collection: 'posts', item: post.id, fields: 'description', mode: 'popover' })"
					>
						{{ post.description }}
					</p>

					<div class="flex justify-start">
						<ShareDialog :post-url="postUrl" :post-title="post.title" />
					</div>
					<div>
						<Separator class="h-[1px] bg-gray-300 my-4" />
						<h3 class="font-bold mb-4">Related Posts</h3>
						<div class="space-y-4">
							<NuxtLink
								v-for="relatedPost in relatedPosts"
								:key="relatedPost.id"
								:to="localize(`/blog/${relatedPost.slug}`)"
								class="flex items-center space-x-4 hover:text-accent group"
							>
								<div v-if="relatedPost.image" class="relative shrink-0 w-[150px] h-[100px] overflow-hidden rounded-lg">
									<DirectusImage
										:uuid="relatedPost.image as string"
										:alt="relatedPost.title || 'related post image'"
										class="object-cover transition-transform duration-300 group-hover:scale-110"
										fill
										sizes="(max-width: 768px) 100px, (max-width: 1024px) 150px, 150px"
									/>
								</div>
								<span class="font-heading">{{ relatedPost.title }}</span>
							</NuxtLink>
						</div>
					</div>
				</aside>
			</div>
		</Container>
	</div>
	<div v-else class="text-center text-xl mt-[20%]">{{ notFoundMessage }}</div>
</template>
