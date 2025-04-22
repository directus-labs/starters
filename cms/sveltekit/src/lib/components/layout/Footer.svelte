<script lang="ts">
	import { PUBLIC_DIRECTUS_URL } from '$env/static/public';

	import { page } from '$app/state';
	import Container from '../ui/Container.svelte';
	import LightSwitch from './LightSwitch.svelte';

	const directusURL = PUBLIC_DIRECTUS_URL;

	const globals = $derived(page.data?.globals);
	const navPrimary = $derived(page.data?.footerNavigation);
	const lightLogoUrl = $derived(
		globals?.logo ? `${directusURL}/assets/${globals.logo}` : '/images/logo.svg'
	);
	const darkLogoUrl = $derived(
		globals?.logo_dark_mode ? `${directusURL}/assets/${globals.logo_dark_mode}` : ''
	);
</script>

<footer class="bg-gray py-16 dark:bg-[var(--background-variant-color)]">
	<Container class="text-foreground dark:text-white">
		<div class="flex flex-col items-start justify-between gap-8 pt-8 md:flex-row">
			<div class="flex-1">
				<a href="/">
					{#if lightLogoUrl}
						<img
							src={lightLogoUrl}
							alt="Logo"
							class={darkLogoUrl ? 'h-auto w-[120px] dark:hidden' : 'h-auto w-[120px]'}
						/>
					{/if}
					{#if darkLogoUrl}
						<img
							src={darkLogoUrl}
							alt="Logo (Dark Mode)"
							class="hidden h-auto w-[120px] dark:block"
						/>
					{/if}
				</a>
				{#if globals?.description}
					<p class="mt-2 text-description">{globals.description}</p>
				{/if}

				<!-- {/* Social Links */} -->
				{#if globals?.social_links}
					<div class="mt-4 flex space-x-4">
						{#each globals.social_links as social}
							<!-- key={social.service} -->
							<a
								href={social.url}
								target="_blank"
								rel="noopener noreferrer"
								class="hover:text-accent"
							>
								<img
									src={`/icons/social/${social.service === 'x' ? 'twitter' : social.service}.svg`}
									alt={`${social.service} icon`}
									width={24}
									height={24}
									class="size-6 dark:invert"
								/>
							</a>
						{/each}
					</div>
				{/if}
			</div>

			<div class="flex flex-1 flex-col items-start md:items-end">
				<nav class="w-full text-left md:w-auto">
					<ul class="space-y-4">
						{#if navPrimary?.items}
							{#each navPrimary.items as group (group.id)}
								<li>
									{#if group.children && group.page}
										<a href={group.page.permalink} class="text-nav font-medium hover:underline">
											{group.title}
										</a>
									{:else}
										<a href={group?.url || '#'} class="text-nav font-medium hover:underline">
											{group.title}
										</a>
									{/if}
								</li>
							{/each}
						{/if}
						<li>
							<LightSwitch />
						</li>
					</ul>
				</nav>
			</div>
		</div>
	</Container>
</footer>
