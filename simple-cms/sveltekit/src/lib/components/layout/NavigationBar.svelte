<script lang="ts">
	import DirectusImage from '$lib/components/shared/DirectusImage.svelte';
	// import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu';
	// import { Button } from '$lib/components/ui/button';
	// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	import { getDirectusAssetURL } from '$lib/directus/directus-utils';
	import { page } from '$app/state';
	import Container from '$lib/components/ui/Container.svelte';
	import SearchModal from '../ui/SearchModal.svelte';
	import LightSwitch from './LightSwitch.svelte';
	import { PUBLIC_DIRECTUS_URL } from '$env/static/public';

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
			{#each navigation?.items as item}
				{#if item.children.length === 0}
					<Button href={item.page.permalink} variant="ghost">{item.title}</Button>
				{:else}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline' })}
							>{item.title}</DropdownMenu.Trigger
						>
						<DropdownMenu.Content class="w-56">
							<DropdownMenu.Group>
								{#each item.children as child}
									<DropdownMenu.Item>
										<Button href={child.page.permalink} variant="ghost">{child.title}</Button>
									</DropdownMenu.Item>
								{/each}
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{/if}
			{/each}
			<LightSwitch />
			<!--<NavigationMenu className="hidden md:flex">
				<NavigationMenuList className="flex gap-6">
					{navigation?.items?.map((section: any) => (
						<NavigationMenuItem key={section.id}>
							{section.children && section.children.length > 0 ? (
								<>
									<NavigationMenuTrigger className="focus:outline-none">
										<span className="font-heading text-nav">{section.title}</span>
									</NavigationMenuTrigger>
									<NavigationMenuContent className="absolute mt-2 min-w-[150px] rounded-md bg-background p-4 shadow-md">
										<ul className="flex flex-col gap-2 pb-4">
											{section.children.map((child: any) => (
												<li key={child.id}>
													<NavigationMenuLink
														href={child.page?.permalink || child.url || '#'}
														className="font-heading text-nav"
													>
														{child.title}
													</NavigationMenuLink>
												</li>
											))}
										</ul>
									</NavigationMenuContent>
								</>
							) : (
								<NavigationMenuLink
									href={section.page?.permalink || section.url || '#'}
									className="font-heading text-nav"
								>
									{section.title}
								</NavigationMenuLink>
							)}
						</NavigationMenuItem>
					))}
				</NavigationMenuList>
			</NavigationMenu>
			
			<div className="flex md:hidden">
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
					<DropdownMenuContent
						align="start"
						className="top-full w-screen p-6 shadow-md max-w-full overflow-hidden"
					>
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
			</div>
			<ThemeToggle />
			 -->
		</nav>
	</Container>
</header>
