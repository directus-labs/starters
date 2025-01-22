<script setup>
defineProps({
	navigation: {
		type: Object,
		required: false,
		default: () => ({
			items: [],
		}),
	},
	globals: {
		type: Object,
		required: false,
		default: () => ({
			logo: '',
			logo_dark_mode: '',
			description: '',
			social_links: [],
		}),
	},
});

const runtimeConfig = useRuntimeConfig();
const lightLogoUrl = globals?.logo ? `${runtimeConfig.public.directusUrl}/assets/${globals.logo}` : '/images/logo.svg';
const darkLogoUrl = globals?.logo_dark_mode
	? `${runtimeConfig.public.directusUrl}/assets/${globals.logo_dark_mode}`
	: '';
</script>

<template>
	<footer v-if="globals" class="bg-gray-100 dark:bg-gray-800 py-16">
		<div class="text-foreground dark:text-white">
			<div class="flex flex-col md:flex-row justify-between items-start gap-8 pt-8">
				<div class="flex-1">
					<NuxtLink to="/" class="inline-block transition-opacity hover:opacity-70">
						<img v-if="lightLogoUrl" :src="lightLogoUrl" alt="Logo" class="w-[120px] h-auto dark:hidden" />
						<img
							v-if="darkLogoUrl"
							:src="darkLogoUrl"
							alt="Logo (Dark Mode)"
							class="w-[120px] h-auto hidden dark:block"
						/>
					</NuxtLink>
					<p v-if="globals?.description" class="text-description mt-2">
						{{ globals.description }}
					</p>
				</div>

				<div class="flex flex-col items-start md:items-end flex-1">
					<nav v-if="navigation?.items" class="w-full md:w-auto text-left">
						<ul class="space-y-4">
							<li v-for="item in navigation.items" :key="item.id">
								<NuxtLink
									v-if="item.page?.permalink"
									:to="item.page.permalink"
									class="text-nav font-medium hover:underline"
								>
									{{ item.title }}
								</NuxtLink>
								<a v-else :href="item.url || '#'" class="text-nav font-medium hover:underline">
									{{ item.title }}
								</a>
							</li>
						</ul>
					</nav>
				</div>
			</div>
		</div>
	</footer>
</template>
