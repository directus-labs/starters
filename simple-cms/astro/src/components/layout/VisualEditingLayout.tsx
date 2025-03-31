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
  const { data: siteData, mutate } = useSWR('/api/site-data', fetchSiteData, {
    fallbackData: { globals, headerNavigation, footerNavigation },
    revalidateOnFocus: false,
  });

  const navRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const { isVisualEditingEnabled, apply } = useVisualEditing();

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
      <NavigationBar ref={navRef} navigation={siteData.headerNavigation} globals={siteData.globals} />
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
