/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useRef, useEffect } from 'react';
import useSWR from 'swr';
import { useVisualEditing } from '@/hooks/useVisualEditing';
import NavigationBar from './NavigationBar';
import Footer from './Footer';
import { fetchSiteData } from '@/lib/directus/fetchers';
import type { ReactNode } from 'react';

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
          ...siteData.headerNavigation,
          items: (siteData.headerNavigation.items || []).map((item: any) => ({
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
          ...siteData.globals,
          logo: typeof siteData.globals.logo === 'string' ? siteData.globals.logo : undefined,
          logo_dark_mode:
            typeof siteData.globals.logo_dark_mode === 'string' ? siteData.globals.logo_dark_mode : undefined,
        }}
      />

      {children}
      <Footer
        ref={footerRef}
        navigation={{
          ...siteData.footerNavigation,
          items: (siteData.footerNavigation.items || []).map((item: any) => ({
            ...item,
            page: item.page ? { permalink: item.page.permalink || null } : undefined,
          })),
        }}
        globals={{
          ...siteData.globals,
          logo: typeof siteData.globals.logo === 'string' ? siteData.globals.logo : null,
          logo_dark_mode: typeof siteData.globals.logo_dark_mode === 'string' ? siteData.globals.logo_dark_mode : null,
          social_links: siteData.globals.social_links || undefined,
        }}
      />
    </>
  );
}
