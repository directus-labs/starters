<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	import { page } from '$app/state';
	import Container from '$lib/components/ui/Container.svelte';
	import SearchModal from '../ui/SearchModal.svelte';
	import LightSwitch from './LightSwitch.svelte';
	import { PUBLIC_DIRECTUS_URL } from '$env/static/public';
	import { goto } from '$app/navigation';
	import { ChevronDown, Menu } from 'lucide-svelte';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import setAttr from '$lib/directus/visualEditing';

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

<header class="sticky top-0 z-50 w-full bg-background font-heading text-foreground">
	<Container class="flex items-center justify-between p-4">
		<a href="/" class="flex-shrink-0">
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
			<div
				class=" hidden gap-2 md:flex"
				data-directus={navigation
					? setAttr({
							collection: 'navigation',
							item: navigation.id,
							fields: ['items'],
							mode: 'modal'
						})
					: undefined}
			>
				{#each navigation?.items as item (item.id)}
					{#if item.children.length === 0}
						<Button
							href={item.page.permalink}
							variant="ghost"
							class="!font-heading !text-nav !text-inherit
">{item.title}</Button
						>
					{:else}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger
								class="data-[active]:text-accent/50 data-[state=open]:text-accent/50 group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2  font-medium transition-colors hover:text-accent focus:text-accent focus:outline-none disabled:pointer-events-none disabled:opacity-50"
								>{item.title}
								<ChevronDown
									class="relative top-[1px] ml-1 size-3 transition duration-200 group-data-[state=open]:rotate-180"
								/>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content
								class="top-full z-50 w-56 max-w-full overflow-hidden  rounded-xl bg-background  shadow-md   data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:bg-background-variant"
							>
								{#each item.children as child}
									<DropdownMenu.Item class="!bg-transparent">
										<a class="hover:text-primary-500 w-full text-nav" href={child.page.permalink}
											>{child.title}</a
										>
									</DropdownMenu.Item>
								{/each}
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					{/if}
				{/each}
			</div>

			<div class="flex md:hidden">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline' })}>
						<Menu />
					</DropdownMenu.Trigger>
					<DropdownMenu.Content
						forceMount
						align="start"
						class="top-full z-50 w-screen min-w-[8rem] max-w-full overflow-hidden rounded bg-background-muted p-6 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:bg-background-variant"
					>
						{#snippet child({ wrapperProps, props, open })}
							{#if open}
								<div {...wrapperProps}>
									<div {...props}>
										<div class="flex flex-col gap-4">
											{#each navigation?.items as item (item.id)}
												{#if item.children.length === 0}
													<DropdownMenu.Item class="!bg-transparent p-0 "
														><a
															href={item.page?.permalink || item.url || '#'}
															class="w-full font-heading text-nav"
														>
															{item.title}</a
														></DropdownMenu.Item
													>
												{:else}
													<Collapsible.Root>
														<Collapsible.Trigger
															class="group flex w-full items-center text-left font-heading text-nav hover:text-accent"
														>
															{item.title}
															<ChevronDown
																class="ml-1 size-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
															/>
														</Collapsible.Trigger>
														<Collapsible.Content>
															<div class="ml-4 mt-2 flex flex-col gap-2">
																{#each item.children as child (child.id)}
																	<a
																		class="w-full font-heading text-nav"
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
