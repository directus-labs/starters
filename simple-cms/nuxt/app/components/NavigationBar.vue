<script setup>
import { Menu } from 'lucide-vue-next';

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
		}),
	},
});

const lightLogoUrl = globals?.logo
	? `${useRuntimeConfig().public.directusUrl}/assets/${globals.logo}`
	: '/images/logo.svg';
const darkLogoUrl = globals?.logo_dark_mode
	? `${useRuntimeConfig().public.directusUrl}/assets/${globals.logo_dark_mode}`
	: '';
</script>

<template>
	<header class="sticky top-0 z-50 w-full bg-background text-foreground">
		<div class="flex items-center justify-between p-4 max-w-7xl mx-auto">
			<NuxtLink to="/" class="flex-shrink-0">
				<img v-if="lightLogoUrl" :src="lightLogoUrl" alt="Logo" class="w-[120px] h-auto dark:hidden" />
				<img v-if="darkLogoUrl" :src="darkLogoUrl" alt="Logo (Dark Mode)" class="w-[120px] h-auto hidden dark:block" />
			</NuxtLink>
			<nav class="flex items-center gap-4">
				<ul class="hidden md:flex gap-6">
					<li v-for="item in navigation.items" :key="item.id">
						<NuxtLink :to="item.page?.permalink || item.url || '#'">
							{{ item.title }}
						</NuxtLink>
					</li>
				</ul>
			</nav>
		</div>
	</header>
</template>
