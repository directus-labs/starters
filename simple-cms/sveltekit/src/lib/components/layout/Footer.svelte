<script lang="ts">
	import { PUBLIC_DIRECTUS_URL } from '$env/static/public';
	import { fetchFooterData } from '$lib/directus/fetchers';

	let footer = fetchFooterData(); // TODO Move to layout.server.ts
</script>

{#await footer then { navPrimary, globals }}
	<footer class="bg-gray dark:bg-gray py-16">
		<div class="px-16 text-foreground dark:text-black lg:px-32">
			<div class="flex flex-col items-start justify-between gap-8 pt-8 md:flex-row">
				<div class="flex-1">
					<a href="/">
						{#if globals?.logo}
							<img
								src={`${PUBLIC_DIRECTUS_URL}/assets/${globals.logo}`}
								alt="Logo"
								class="h-auto w-[120px]"
							/>
						{:else}
							<img src="/images/logo.svg" alt="Logo" class="h-[45px] w-[90px]" />
						{/if}
					</a>
					{#if globals?.description}
						<p class="text-description mt-2">{globals.description}</p>
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
										src={`/icons/social/${social.service}.svg`}
										alt={`${social.service} icon`}
										width={24}
										height={24}
										class="size-6"
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
							<!-- <ThemeToggle className="dark:text-white" /> -->
						</ul>
					</nav>
				</div>
			</div>
		</div>
	</footer>
{/await}
