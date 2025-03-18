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

<header class="sticky top-0 z-50 w-full bg-background text-foreground">
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
			<div class="hidden md:flex">
				{#each navigation?.items as item (item.id)}
					{#if item.children.length === 0}
						<Button href={item.page.permalink} variant="ghost">{item.title}</Button>
					{:else}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline' })}
								>{item.title}</DropdownMenu.Trigger
							>
							<DropdownMenu.Content
								class="top-full z-50 w-56 max-w-full overflow-hidden  rounded bg-background p-6 shadow-md   data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:bg-background-variant"
							>
								{#each item.children as child}
									<DropdownMenu.Item
										onSelect={() => {
											goto(child.page.permalink);
										}}
									>
										<!-- <Button href={child.page.permalink} variant="ghost">{child.title}</Button> -->
										<!-- Is there a way to do this without using goto? -->
										{child.title}
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
						class="top-full z-50 w-screen min-w-[8rem] max-w-full overflow-hidden  rounded bg-background p-6 shadow-md   data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:bg-background-variant"
					>
						{#snippet child({ wrapperProps, props, open })}
							{#if open}
								<div {...wrapperProps}>
									<div {...props}>
										<div class="flex flex-col gap-4">
											{#each navigation?.items as item (item.id)}
												{#if item.children.length === 0}
													<DropdownMenu.Item class="p-0"
														><span class=" font-heading text-nav">
															{item.title}</span
														></DropdownMenu.Item
													>
												{:else}
													<Collapsible.Root>
														<Collapsible.Trigger>
															<div class="flex items-center justify-between font-heading text-nav">
																{item.title}
																<ChevronDown
																	class="ml-1 size-4 transition-transform duration-200 hover:rotate-180 focus:rotate-180 active:rotate-180"
																/>
															</div>
														</Collapsible.Trigger>
														<Collapsible.Content>
															{#each item.children as child (child.id)}
																<div class="ml-4 mt-2 flex flex-col gap-2">
																	<a href={child.page?.permalink || child.url}>{child.title}</a>
																</div>
															{/each}
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

			<!-- <div class="flex md:hidden">
						<DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
							<DropdownMenuTrigger asChild>
								<Button
									variant="link"
									size="icon"
									aria-label="Open menu"
									className="dark:text-white dark:hover:text-accent"
								>
									<Menu />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="top-full w-screen p-6 shadow-md max-w-full overflow-hidden">
								<div className="flex flex-col gap-4">
									{navigation?.items?.map((section: any) => (
										<div key={section.id}>
											{section.children && section.children.length > 0 ? (
												<Collapsible>
													<CollapsibleTrigger className="font-heading text-nav hover:text-accent w-full text-left flex items-center focus:outline-none">
														<span>{section.title}</span>
														<ChevronDown className="size-4 ml-1 hover:rotate-180 active:rotate-180 focus:rotate-180" />
													</CollapsibleTrigger>
													<CollapsibleContent className="ml-4 mt-2 flex flex-col gap-2">
														{section.children.map((child: any) => (
															<Link
																key={child.id}
																href={child.page?.permalink || child.url || '#'}
																className="font-heading text-nav"
																onClick={handleLinkClick}
															>
																{child.title}
															</Link>
														))}
													</CollapsibleContent>
												</Collapsible>
											) : (
												<Link
													href={section.page?.permalink || section.url || '#'}
													className="font-heading text-nav"
													onClick={handleLinkClick}
												>
													{section.title}
												</Link>
											)}
										</div>
									))}
								</div>
							</DropdownMenuContent>
						</DropdownMenu>
					</div> -->
			<LightSwitch />
		</nav>
	</Container>
</header>
