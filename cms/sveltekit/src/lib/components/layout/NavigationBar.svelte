<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';

	import { page } from '$app/state';
	import Container from '$lib/components/ui/Container.svelte';
	import SearchModal from '../ui/SearchModal.svelte';
	import LightSwitch from './LightSwitch.svelte';
	import { PUBLIC_DIRECTUS_URL } from '$env/static/public';
	import { ChevronDown, Menu } from '@lucide/svelte';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import setAttr from '$lib/directus/visualEditing';

	import { IsMobile } from '$lib/hooks/is-mobile.svelte';

	const isMobile = new IsMobile();

	const globals = $derived(page.data.globals);
	const navigation = $derived(page.data.headerNavigation);
	const directusURL = PUBLIC_DIRECTUS_URL;

	const lightLogoUrl = $derived(
		globals?.logo ? `${directusURL}/assets/${globals.logo}` : '/images/logo.svg'
	);
	const darkLogoUrl = $derived(
		globals?.logo_dark_mode ? `${directusURL}/assets/${globals.logo_dark_mode}` : ''
	);
</script>

<header class="bg-background font-heading text-foreground sticky top-0 z-60 w-full">
	<Container class="flex items-center justify-between p-4">
		<a href="/" class="shrink-0">
			<img
				src={lightLogoUrl}
				alt="Logo"
				width="150"
				height="100"
				class="h-auto w-[120px] dark:hidden"
			/>
			<img
				src={darkLogoUrl}
				alt="Logo"
				width="150"
				height="100"
				class="hidden h-auto w-[120px] dark:block"
			/>
		</a>
		<nav class="flex items-center gap-4">
			<SearchModal />
			<!-- <NavigationMenuItems /> -->
			<NavigationMenu.Root
				viewport={isMobile.current}
				class="hidden gap-6 md:flex"
				data-directus={navigation
					? setAttr({
							collection: 'navigation',
							item: navigation.id,
							fields: ['items'],
							mode: 'modal'
						})
					: undefined}
			>
				<NavigationMenu.List class="flex-wrap">
					{#each navigation?.items as item (item.id)}
						<NavigationMenu.Item>
							{#if item.children.length === 0}
								<!-- Buttons -->
								<NavigationMenu.Link href={item.page.permalink}>{item.title}</NavigationMenu.Link>
							{:else}
								<!-- Dropdown -->
								<NavigationMenu.Trigger class="focus:outline-none">
									<span class="font-heading text-nav">
										{item.title}
									</span>
								</NavigationMenu.Trigger>
								<NavigationMenu.Content
									class="bg-background absolute mt-2 min-w-[150px] rounded-md p-4 shadow-md"
								>
									<ul class="grid w-[150px] gap-2">
										{#each item.children as child (child.id)}
											<li>
												<NavigationMenu.Link
													class="font-heading text-nav"
													href={child.page.permalink}
												>
													{child.title}
												</NavigationMenu.Link>
											</li>
										{/each}
									</ul>
								</NavigationMenu.Content>
							{/if}
						</NavigationMenu.Item>
					{/each}
				</NavigationMenu.List>
			</NavigationMenu.Root>

			<div class="flex md:hidden">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						aria-label="Navigation Menu"
						class={buttonVariants({ variant: 'outline' })}
					>
						<Menu />
					</DropdownMenu.Trigger>
					<DropdownMenu.Content
						forceMount
						align="start"
						class="bg-background-muted data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:bg-background-variant top-full z-50 w-screen max-w-full min-w-32 overflow-hidden rounded-sm p-6 shadow-md"
					>
						{#snippet child({ wrapperProps, props, open })}
							{#if open}
								<div {...wrapperProps}>
									<div {...props}>
										<div class="flex flex-col gap-4">
											{#each navigation?.items as item (item.id)}
												{#if item.children.length === 0}
													<DropdownMenu.Item class="bg-transparent! p-0 "
														><a
															href={item.page?.permalink || item.url || '#'}
															class="font-heading text-nav w-full"
														>
															{item.title}</a
														></DropdownMenu.Item
													>
												{:else}
													<Collapsible.Root>
														<Collapsible.Trigger
															class="font-heading text-nav hover:text-accent group flex w-full items-center text-left"
														>
															{item.title}
															<ChevronDown
																class="ml-1 size-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
															/>
														</Collapsible.Trigger>
														<Collapsible.Content>
															<div class="mt-2 ml-4 flex flex-col gap-2">
																{#each item.children as child (child.id)}
																	<a
																		class="font-heading text-nav w-full"
																		href={child.page?.permalink || child.url}>{child.title}</a
																	>
																{/each}
															</div>
														</Collapsible.Content>
													</Collapsible.Root>
												{/if}
											{/each}
										</div>
									</div>
								</div>
							{/if}
						{/snippet}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>

			<LightSwitch />
		</nav>
	</Container>
</header>
