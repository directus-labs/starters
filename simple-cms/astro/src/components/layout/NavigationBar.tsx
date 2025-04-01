'use client';
import { useState } from 'react';
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
import Container from '@/components/ui/Container';
import ThemeToggle from '@/components/ui/ThemeToggle';
import SearchModal from '@/components/ui/SearchModal';
import { Button } from '@/components/ui/button';
import { forwardRef } from 'react';
import { setAttr } from '@directus/visual-editing';

interface NavigationBarProps {
  navigation: any;
  globals: any;
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

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  return (
    <header ref={ref} className="sticky top-0 z-50 w-full bg-background text-foreground">
      <Container className="flex items-center justify-between p-4">
        <a href="/" className="flex-shrink-0">
          <img src={lightLogoUrl} alt="Logo" width={150} height={100} className="w-[120px] h-auto dark:hidden" />
          {darkLogoUrl && (
            <img
              src={darkLogoUrl}
              alt="Logo (Dark Mode)"
              width={150}
              height={100}
              className="w-[120px] h-auto hidden dark:block"
            />
          )}
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
            <NavigationMenuList>
              {navigation?.items?.map((section: any) => (
                <NavigationMenuItem key={section.id}>
                  {section.children && section.children.length > 0 ? (
                    <>
                      <NavigationMenuTrigger className="font-heading text-nav focus:outline-none">
                        {section.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-background">
                        <ul className="flex flex-col gap-2 p-4 w-[200px] bg-popover">
                          {section.children.map((child: any) => (
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
                      className="font-heading text-nav block p-2 hover:text-accent"
                    >
                      {section.title}
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
            <NavigationMenuViewport />
          </NavigationMenu>
          <div className="flex md:hidden">
            <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="mt-2 w-[200px] bg-popover">
                {navigation?.items?.map((section: any) => (
                  <div key={section.id} className="p-2">
                    {section.children && section.children.length > 0 ? (
                      <Collapsible open={openSections[section.id]} onOpenChange={() => toggleSection(section.id)}>
                        <CollapsibleTrigger className="flex w-full items-center justify-between p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md">
                          {section.title}
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              openSections[section.id] ? 'rotate-180' : ''
                            }`}
                          />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="ml-4 mt-2">
                          {section.children.map((child: any) => (
                            <a
                              key={child.id}
                              href={child.page?.permalink || child.url || '#'}
                              className="block p-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md"
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
                        className="block p-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md"
                        onClick={handleLinkClick}
                      >
                        {section.title}
                      </a>
                    )}
                  </div>
                ))}
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
