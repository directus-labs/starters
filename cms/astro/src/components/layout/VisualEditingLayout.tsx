'use client';

import { useVisualEditing } from '@/hooks/useVisualEditing';
import { fetchSiteData } from '@/lib/directus/fetchers';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import useSWR from 'swr';
import Footer from './Footer';
import NavigationBar from './NavigationBar';

type SiteGlobals = {
  logo?: string;
  logo_dark_mode?: string;
  social_links?: { service: string; url: string }[];
};

interface VisualEditingLayoutProps {
  headerNavigation: any;
  footerNavigation: any;
  globals: any;
  children: ReactNode;
}

export default function VisualEditingLayout({
  headerNavigation,
  footerNavigation,
  globals,
  children,
}: VisualEditingLayoutProps) {
  const navRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const { isVisualEditingEnabled, apply } = useVisualEditing();

  const { data: siteData, mutate } = useSWR(isVisualEditingEnabled ? '/api/site-data' : null, fetchSiteData, {
    fallbackData: { globals, headerNavigation, footerNavigation },
    revalidateOnFocus: false,
  });

  const layoutData = siteData ?? {
    globals,
    headerNavigation,
    footerNavigation,
  };
  const safeGlobals = (layoutData.globals ?? {}) as SiteGlobals;

  useEffect(() => {
    if (isVisualEditingEnabled) {
      if (navRef.current) {
        apply({
          elements: [navRef.current],
          onSaved: () => {
            mutate();
          },
        });
      }

      if (footerRef.current) {
        apply({
          elements: [footerRef.current],
          onSaved: () => {
            mutate();
          },
        });
      }
    }
  }, [isVisualEditingEnabled, apply, mutate]);

  return (
    <>
      <NavigationBar
        ref={navRef}
        navigation={{
          ...layoutData.headerNavigation,
          items: (layoutData.headerNavigation.items || []).map((item: any) => ({
            id: item.id,
            title: item.title || '',
            url: item.url,
            page: item.page ? { permalink: item.page.permalink || '' } : undefined,
            children: (item.children || []).map((child: any) => ({
              id: child.id,
              title: child.title || '',
              url: child.url,
              page: child.page ? { permalink: child.page.permalink || '' } : undefined,
            })),
          })),
        }}
        globals={{
          ...safeGlobals,
          logo: typeof safeGlobals.logo === 'string' ? safeGlobals.logo : undefined,
          logo_dark_mode: typeof safeGlobals.logo_dark_mode === 'string' ? safeGlobals.logo_dark_mode : undefined,
        }}
      />

      {children}
      <Footer
        ref={footerRef}
        navigation={{
          ...layoutData.footerNavigation,
          items: (layoutData.footerNavigation.items || []).map((item: any) => ({
            ...item,
            page: item.page ? { permalink: item.page.permalink || null } : undefined,
          })),
        }}
        globals={{
          ...safeGlobals,
          logo: typeof safeGlobals.logo === 'string' ? safeGlobals.logo : null,
          logo_dark_mode: typeof safeGlobals.logo_dark_mode === 'string' ? safeGlobals.logo_dark_mode : null,
          social_links: Array.isArray(safeGlobals.social_links) ? safeGlobals.social_links : undefined,
        }}
      />
    </>
  );
}
