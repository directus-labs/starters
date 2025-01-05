<script lang="ts">
	import { fetchNavigationData } from '$lib/directus/fetchers';
	import DirectusImage from '$lib/components/shared/DirectusImage.svelte';
	import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

	let menu = fetchNavigationData('main'); // TODO Move to layout.server.ts
</script>

{#await menu then { navigation, globals }}
	<header class="sticky top-0 z-50 w-full bg-background text-foreground">
		<div class="flex items-center justify-between p-4 sm:px-6 lg:px-8">
			<a href="/">
				{#if globals.logo}
					<DirectusImage
						id={globals.logo}
						alt="Logo"
						width={150}
						height={100}
						className="w-[120px] h-auto"
						priority
					/>
				{:else}
					<img
						src="/images/logo.svg"
						alt="Logo"
						width="150"
						height="100"
						class="h-[45px] w-[90px]"
					/>
					<!-- priority -->
				{/if}
			</a>
			<nav class="hidden items-center gap-6 md:flex">
				<!-- <NavigationMenu>
						<NavigationMenuList className="flex gap-6">
							{#each navigation.items as section (section.id)}
								<NavigationMenuItem >
                                    {#if section.children && section.children.length > 0}

											<NavigationMenuTrigger className="focus:outline-none">
												<span class="font-heading text-nav">{section.title}</span>
											</NavigationMenuTrigger>
											<NavigationMenuContent className="absolute mt-2 min-w-[150px] rounded-md bg-background p-4 shadow-md">
												<ul class="flex flex-col gap-2 pb-4">
													{#each section.children as child (child.id)}
														<li>
															<NavigationMenuLink
																href={child.page?.permalink || child.url || '#'}
																className="font-heading text-nav"
															>
																{child.title}
															</NavigationMenuLink>
														</li>
													{/each}
												</ul>
											</NavigationMenuContent>
										
									{:else}
										<NavigationMenuLink
											href={section.page?.permalink || section.url || '#'}
											className="font-heading text-nav"
										>
											{section.title}
										</NavigationMenuLink>
									{/if}
								</NavigationMenuItem>
							{/each}
						</NavigationMenuList>
					</NavigationMenu>
					<ThemeToggle /> -->
			</nav>
			<!-- {/* Mobile Navigation */} -->
			<div class="flex items-center gap-2 md:hidden">
				<DropdownMenu>
					<DropdownMenuTrigger>
						<Button
							variant="link"
							size="icon"
							aria-label="Open menu"
							class="dark:text-white dark:hover:text-accent"
						>
							☰
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="start"
						class=" bg-gray top-full w-screen max-w-full overflow-hidden p-6 shadow-md"
					>
						<div class="flex flex-col gap-4">
							{#if navigation.items && navigation.items.length > 0}
								{#each navigation?.items as section (section.id)}
									<Collapsible>
										<CollapsibleTrigger
											class="font-heading text-nav flex w-full items-center text-left hover:text-accent focus:outline-none"
										>
											<span>{section.title}</span>
											{#if section.children && section.children.length > 0}
												<ChevronDown
													className="size-4 ml-1 hover:rotate-180 active:rotate-180 focus:rotate-180"
												/>
											{/if}
										</CollapsibleTrigger>
										{#if section.children && section.children.length > 0}
											<CollapsibleContent class="ml-4 mt-2 flex flex-col gap-2">
												{#each section.children as child (child.id)}
													<a
														href={child.page?.permalink || child.url || '#'}
														class="font-heading text-nav"
													>
														{child.title}
													</a>
													<!-- <Link
														key={child.id || `${section.id}-${child.title}`}
														href={child.page?.permalink || child.url || '#'}
														class="font-heading text-nav"
													>
														{child.title}
													</Link> -->
												{/each}
											</CollapsibleContent>
										{/if}
									</Collapsible>
								{/each}
							{/if}
						</div>
					</DropdownMenuContent>
				</DropdownMenu>
				<span>Theme Toggle</span>
			</div>
		</div>
	</header>
{/await}
