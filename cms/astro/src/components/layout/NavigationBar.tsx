'use client';

import { useEffect, useState } from 'react';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';
import SearchModal from '@/components/ui/SearchModal';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { forwardRef } from 'react';
import { setAttr } from '@directus/visual-editing';

interface NavigationBarProps {
  navigation: {
    id: string;
    items: {
      id: string;
      title: string;
      url?: string;
      page?: { permalink: string };
      children?: {
        id: string;
        title: string;
        url?: string;
        page?: { permalink: string };
      }[];
    }[];
  };
  globals: {
    logo?: string;
    logo_dark_mode?: string;
  };
}

const NavigationBar = forwardRef<HTMLElement, NavigationBarProps>(({ navigation, globals }, ref) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const directusURL = import.meta.env.PUBLIC_DIRECTUS_URL;

  const lightLogoUrl = globals?.logo ? `${directusURL}/assets/${globals.logo}` : '/images/logo.svg';
  const darkLogoUrl = globals?.logo_dark_mode ? `${directusURL}/assets/${globals.logo_dark_mode}` : '';

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Close mobile menu on window resize or navigation
  useEffect(() => {
    const handleResize = () => setMobileMenuOpen(false);
    const handleRouteChange = () => setMobileMenuOpen(false);
    window.addEventListener('resize', handleResize);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <header ref={ref} className="sticky top-0 z-50 w-full bg-background text-foreground">
      <Container className="flex items-center justify-between p-4">
        <a href="/" className="flex-shrink-0">
          <img src={lightLogoUrl} alt="Logo" className="w-[120px] h-auto dark:hidden" />
          {darkLogoUrl && <img src={darkLogoUrl} alt="Dark Logo" className="w-[120px] h-auto hidden dark:block" />}
        </a>
        <nav className="flex items-center gap-4">
          <SearchModal />
          <NavigationMenu
            className="hidden md:flex"
            data-directus={
              navigation
                ? setAttr({
                    collection: 'navigation',
                    item: navigation.id,
                    fields: ['items'],
                    mode: 'modal',
                  })
                : undefined
            }
          >
            <NavigationMenuList className="flex gap-6">
              {navigation?.items?.map((section) => (
                <NavigationMenuItem key={section.id}>
                  {section.children?.length ? (
                    <>
                      <NavigationMenuTrigger className="font-heading text-nav focus:outline-none">
                        <span className="font-heading text-nav">{section.title}</span>
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-background">
                        <ul className="flex flex-col gap-2 p-4 w-[200px] bg-popover">
                          {section.children.map((child) => (
                            <li key={child.id}>
                              <NavigationMenuLink
                                href={child.page?.permalink || child.url || '#'}
                                className="font-heading text-nav block w-full p-2 rounded-md hover:text-accent"
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
            <NavigationMenuViewport />
          </NavigationMenu>

          {/* Mobile menu */}
          <div className="flex md:hidden">
            <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="dark:text-white dark:hover:text-accent"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="top-full w-screen max-w-full p-6 shadow-md bg-background z-50"
              >
                <div className="flex flex-col gap-4">
                  {navigation?.items?.map((section) => (
                    <div key={section.id}>
                      {section.children?.length ? (
                        <Collapsible open={openSections[section.id]} onOpenChange={() => toggleSection(section.id)}>
                          <CollapsibleTrigger className="flex items-center justify-between w-full font-heading text-nav hover:text-accent">
                            <span>{section.title}</span>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-200 ${
                                openSections[section.id] ? 'rotate-180' : ''
                              }`}
                            />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="ml-4 mt-2 flex flex-col gap-2">
                            {section.children.map((child) => (
                              <a
                                key={child.id}
                                href={child.page?.permalink || child.url || '#'}
                                className="font-heading text-nav"
                                onClick={handleLinkClick}
                              >
                                {child.title}
                              </a>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <a
                          href={section.page?.permalink || section.url || '#'}
                          className="font-heading text-nav"
                          onClick={handleLinkClick}
                        >
                          {section.title}
                        </a>
                      )}
                    </div>
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
});

NavigationBar.displayName = 'NavigationBar';
export default NavigationBar;
