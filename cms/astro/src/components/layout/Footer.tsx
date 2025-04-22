'use client';

import { forwardRef } from 'react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Container from '@/components/ui/Container';
import SocialIcon from '@/components/ui/SocialIcon';

interface SocialLink {
  service: string;
  url: string;
}

interface NavigationItem {
  id: string;
  title: string;
  url?: string | null;
  page?: { permalink?: string | null };
}

interface FooterProps {
  navigation: { items: NavigationItem[] };
  globals: {
    logo?: string | null;
    logo_dark_mode?: string | null;
    description?: string | null;
    social_links?: SocialLink[];
  };
}

const Footer = forwardRef<HTMLElement, FooterProps>(({ navigation, globals }, ref) => {
  const directusURL = import.meta.env.PUBLIC_DIRECTUS_URL;
  const lightLogoUrl = globals?.logo ? `${directusURL}/assets/${globals.logo}` : '/images/logo.svg';
  const darkLogoUrl = globals?.logo_dark_mode ? `${directusURL}/assets/${globals.logo_dark_mode}` : '';

  return (
    <footer ref={ref} className="bg-gray dark:bg-[var(--background-variant-color)] py-16">
      <Container className="text-foreground dark:text-white">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 pt-8">
          <div className="flex-1">
            <a href="/" className="inline-block transition-opacity hover:opacity-70">
              <img
                src={lightLogoUrl}
                alt="Logo"
                className={darkLogoUrl ? 'w-[120px] h-auto dark:hidden' : 'w-[120px] h-auto'}
              />
              {darkLogoUrl && (
                <img src={darkLogoUrl} alt="Logo (Dark Mode)" className="w-[120px] h-auto hidden dark:block" />
              )}
            </a>
            {globals?.description && <p className="text-description mt-2">{globals.description}</p>}
            {globals?.social_links && (
              <div className="mt-4 flex space-x-4">
                {globals.social_links.map((social) => (
                  <a
                    key={social.service}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-8 rounded bg-transparent inline-flex items-center justify-center transition-colors hover:opacity-70"
                  >
                    <SocialIcon service={social.service} size={24} className="size-6" />
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-start md:items-end flex-1">
            <nav className="w-full md:w-auto text-left">
              <ul className="space-y-4">
                {navigation?.items?.map((group: NavigationItem) => (
                  <li key={group.title}>
                    <a
                      href={group.page?.permalink || group.url || '#'}
                      className="text-nav font-medium hover:underline"
                    >
                      {group.title}
                    </a>
                  </li>
                ))}
                <ThemeToggle className="dark:text-white" />
              </ul>
            </nav>
          </div>
        </div>
      </Container>
    </footer>
  );
});

Footer.displayName = 'Footer';
export default Footer;
