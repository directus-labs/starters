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
		</nav>
	</Container>
</header>
