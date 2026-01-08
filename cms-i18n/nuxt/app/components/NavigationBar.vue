<script setup lang="ts">
import { Menu, ChevronDown } from 'lucide-vue-next';
import SearchModal from '~/components/base/SearchModel.vue';
import LanguageSwitcher from '~/components/shared/LanguageSwitcher.vue';
import { DEFAULT_LOCALE, type Locale } from '~/lib/i18n/config';
import { localizeLink } from '~/lib/i18n/utils';

interface NavigationItem {
	id: string;
	title?: string | null;
	url?: string | null;
	page?: {
		permalink?: string | null;
	} | null;
	children?: NavigationItem[] | string[] | null;
}

// Using template ref to expose the navigation bar to the layout for visual editing
const navigationRef = useTemplateRef('navigationRef');
defineExpose({ navigationRef });

interface Navigation {
	id?: string | null;
	items?: NavigationItem[] | string[] | null;
}

interface Globals {
	logo?: string | { id: string } | null;
	logo_dark_mode?: string | { id: string } | null;
}

const props = defineProps<{
	navigation: Navigation;
	globals: Globals;
	locale?: Locale;
	supportedLocales?: Locale[];
	localeNames?: Record<Locale, string>;
}>();

const menuOpen = ref(false);
const runtimeConfig = useRuntimeConfig();
const { setAttr } = useVisualEditing();

// Helper to get logo ID from string or object
const getLogoId = (logo: string | { id: string } | null | undefined): string | null => {
	if (!logo) return null;
	if (typeof logo === 'string') return logo;
	return logo.id;
};

const lightLogoUrl = computed(() => {
	const logoId = getLogoId(props.globals?.logo);
	return logoId ? `${runtimeConfig.public.directusUrl}/assets/${logoId}` : '/images/logo.svg';
});

const darkLogoUrl = computed(() => {
	const logoId = getLogoId(props.globals?.logo_dark_mode);
	return logoId ? `${runtimeConfig.public.directusUrl}/assets/${logoId}` : '';
});

const handleLinkClick = () => {
	menuOpen.value = false;
};

// Current locale for link localization
const currentLocale = computed(() => props.locale || DEFAULT_LOCALE);

// Helper to localize internal paths using shared utility
const localize = (path: string | null | undefined) => localizeLink(path, currentLocale.value);

// Localized home path
const homeLink = computed(() => localize('/'));

// Helper to check if an item is a full NavigationItem (not just a string ID)
const isNavigationItem = (item: NavigationItem | string): item is NavigationItem => {
	return typeof item !== 'string';
};

// Get navigation items as full objects (filter out string IDs)
const navigationItems = computed(() => {
	const items = props.navigation?.items;
	if (!items) return [];
	return items.filter(isNavigationItem);
});

// Helper to get children as full NavigationItems
const getChildren = (item: NavigationItem): NavigationItem[] => {
	if (!item.children) return [];
	return item.children.filter(isNavigationItem);
};

// Helper to get page permalink from page object
const getPagePermalink = (page: { permalink?: string | null } | null | undefined): string | null => {
	return page?.permalink || null;
};
</script>

<template>
	<header ref="navigationRef" class="sticky top-0 z-50 w-full bg-background text-foreground">
		<Container class="flex items-center justify-between p-4">
			<NuxtLink :to="homeLink" class="flex-shrink-0">
				<img :src="lightLogoUrl" alt="Logo" class="w-[120px] h-auto dark:hidden" width="150" height="100" />
				<img
					v-if="darkLogoUrl"
					:src="darkLogoUrl"
					alt="Logo (Dark Mode)"
					class="w-[120px] h-auto hidden dark:block"
					width="150"
					height="100"
				/>
			</NuxtLink>

			<nav class="flex items-center gap-4">
				<SearchModal />
				<NavigationMenu
					class="hidden md:flex"
					:data-directus="
						setAttr({ collection: 'navigation', item: props.navigation.id || null, fields: ['items'], mode: 'modal' })
					"
				>
					<NavigationMenuList class="flex gap-6">
						<NavigationMenuItem v-for="section in navigationItems" :key="section.id">
							<template v-if="getChildren(section).length">
								<NavigationMenuTrigger
									class="focus:outline-none font-heading !text-nav hover:bg-background hover:text-accent"
								>
									{{ section.title }}
								</NavigationMenuTrigger>
								<NavigationMenuContent class="min-w-[200px] rounded-md bg-background p-4 shadow-md">
									<ul class="min-h-[100px] flex flex-col gap-2">
										<li v-for="child in getChildren(section)" :key="child.id">
											<NavigationMenuLink as-child>
												<NuxtLink
													:to="localize(getPagePermalink(child.page) || child.url)"
													class="font-heading text-nav"
												>
													{{ child.title }}
												</NuxtLink>
											</NavigationMenuLink>
										</li>
									</ul>
								</NavigationMenuContent>
							</template>

							<NavigationMenuLink v-else as-child>
								<NuxtLink
									:to="localize(getPagePermalink(section.page) || section.url)"
									class="font-heading text-nav p-2"
								>
									{{ section.title }}
								</NuxtLink>
							</NavigationMenuLink>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>

				<div class="flex md:hidden">
					<DropdownMenu v-model:open="menuOpen">
						<DropdownMenuTrigger as-child>
							<Button
								variant="link"
								size="icon"
								aria-label="Open menu"
								class="text-black dark:text-white dark:hover:text-accent"
							>
								<Menu />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent
							align="start"
							class="top-full w-screen p-6 shadow-md max-w-full overflow-hidden bg-background"
						>
							<div class="flex flex-col gap-4">
								<div v-for="section in navigationItems" :key="section.id">
									<Collapsible v-if="getChildren(section).length">
										<CollapsibleTrigger
											class="font-heading text-nav hover:text-accent w-full text-left flex items-center focus:outline-none"
										>
											<span>{{ section.title }}</span>
											<ChevronDown class="size-4 ml-1 hover:rotate-180 active:rotate-180 focus:rotate-180" />
										</CollapsibleTrigger>
										<CollapsibleContent class="ml-4 mt-2 flex flex-col gap-2">
											<NuxtLink
												v-for="child in getChildren(section)"
												:key="child.id"
												:to="localize(getPagePermalink(child.page) || child.url)"
												class="font-heading text-nav"
												@click="handleLinkClick"
											>
												{{ child.title }}
											</NuxtLink>
										</CollapsibleContent>
									</Collapsible>

									<NuxtLink
										v-else
										:to="localize(getPagePermalink(section.page) || section.url)"
										class="font-heading text-nav"
										@click="handleLinkClick"
									>
										{{ section.title }}
									</NuxtLink>
								</div>
							</div>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<LanguageSwitcher
					v-if="locale && supportedLocales && localeNames"
					:current-locale="locale"
					:supported-locales="supportedLocales"
					:locale-names="localeNames"
				/>
				<ThemeToggle />
			</nav>
		</Container>
	</header>
</template>
