import { fetchNavigationData } from '@/lib/directus/fetchers';
import Image from 'next/image';
import Link from 'next/link';
import {
	NavigationMenu,
	NavigationMenuList,
	NavigationMenuItem,
	NavigationMenuTrigger,
	NavigationMenuContent,
	NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronDown, Menu } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import SearchModal from '@/components/ui/SearchModal';
import Container from '@/components/ui/container';

export default async function NavigationBar() {
	let menu;
	try {
		menu = await fetchNavigationData('main');
	} catch (error) {
		console.error('Error loading navigation data:', error);

		return null;
	}

	const { navigation, globals } = menu;
	const directusURL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
	const lightLogoUrl = globals?.logo ? `${directusURL}/assets/${globals.logo}` : '/images/logo.svg';
	const darkLogoUrl = globals?.dark_mode_logo ? `${directusURL}/assets/${globals.dark_mode_logo}` : '';

	return (
		<header className="sticky top-0 z-50 w-full bg-background text-foreground">
			<Container className="flex items-center justify-between p-4">
				<Link href="/" className="flex-shrink-0">
					<Image
						src={lightLogoUrl}
						alt="Logo"
						width={150}
						height={100}
						className="w-[120px] h-auto dark:hidden"
						priority
					/>
					{darkLogoUrl && (
						<Image
							src={darkLogoUrl}
							alt="Logo (Dark Mode)"
							width={150}
							height={100}
							className="w-[120px] h-auto hidden dark:block"
							priority
						/>
					)}
				</Link>

				<nav className="flex items-center gap-4">
					<SearchModal />
					<NavigationMenu className="hidden md:flex">
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
						<DropdownMenu>
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
										<Collapsible key={section.id}>
											<CollapsibleTrigger className="font-heading text-nav hover:text-accent w-full text-left flex items-center focus:outline-none">
												<span>{section.title}</span>
												{section.children && section.children.length > 0 && (
													<ChevronDown className="size-4 ml-1 hover:rotate-180 active:rotate-180 focus:rotate-180" />
												)}
											</CollapsibleTrigger>
											{section.children && section.children.length > 0 && (
												<CollapsibleContent className="ml-4 mt-2 flex flex-col gap-2">
													{section.children.map((child: any) => (
														<Link
															key={child.id || `${section.id}-${child.title}`}
															href={child.page?.permalink || child.url || '#'}
															className="font-heading text-nav"
														>
															{child.title}
														</Link>
													))}
												</CollapsibleContent>
											)}
										</Collapsible>
									))}
								</div>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
					<ThemeToggle />
				</nav>
			</Container>
		</header>
	);
}
