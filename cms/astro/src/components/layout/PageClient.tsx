'use client';

import useSWR from 'swr';
import { useEffect, useRef, useState } from 'react';
import { useVisualEditing } from '@/hooks/useVisualEditing';
import PageBuilder from '@/components/layout/PageBuilder';
import type { PageBlock } from '@/types/directus-schema';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { getPageIdForEditing, setAttr, setVisualEditingPageContext } from '@/lib/directus/visualEditing';

interface PageClientProps {
  initialSections: PageBlock[];
  permalink: string;
  pageId: string;
}

interface VisualEditingOptions {
  customClass?: string;
  onSaved?: () => void;
  elements?: HTMLElement | HTMLElement[];
}

const isLivePreview = () => {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);

  return params.get('preview') === 'true' || !!params.get('version') || !!params.get('id');
};

const fetchBlocks = async (permalink: string, params: URLSearchParams): Promise<PageBlock[]> => {
  const queryString = params.toString();
  const url = `/api/page-blocks?permalink=${encodeURIComponent(permalink)}${queryString ? `&${queryString}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch blocks');
  const data = await res.json();

  return data.blocks;
};

export default function PageClient({ initialSections, permalink, pageId }: PageClientProps) {
  const { isVisualEditingEnabled, apply } = useVisualEditing();
  const rootRef = useRef<HTMLDivElement>(null);
  const [livePreview, setLivePreview] = useState(isLivePreview);
  const [isHydrated, setIsHydrated] = useState(false);

  setVisualEditingPageContext(pageId, isHydrated);

  useEffect(() => {
    const sync = () => setLivePreview(isLivePreview());
    setIsHydrated(true);
    sync();
    document.addEventListener('astro:after-swap', sync);

    return () => document.removeEventListener('astro:after-swap', sync);
  }, []);

  const swrKey =
    (isVisualEditingEnabled || livePreview) && typeof window !== 'undefined'
      ? `${permalink}-${new URLSearchParams(window.location.search).toString()}`
      : null;

  const { data: sections = initialSections, mutate } = useSWR(
    swrKey,
    () => fetchBlocks(permalink, new URLSearchParams(window.location.search)),
    {
      fallbackData: initialSections,
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (!isVisualEditingEnabled || !rootRef.current) return;

    const editButton = rootRef.current.querySelector('#visual-editing-button') as HTMLElement | null;
    const editableElements = Array.from(rootRef.current.querySelectorAll<HTMLElement>('[data-directus]')).filter(
      (element) => element !== editButton,
    );

    if (editableElements.length > 0) {
      apply({
        elements: editableElements,
        onSaved: () => mutate(),
      } as VisualEditingOptions);
    }

    if (editButton) {
      apply({
        elements: editButton,
        customClass: 'visual-editing-button-class',
        onSaved: () => mutate(),
      } as VisualEditingOptions);
    }
  }, [isVisualEditingEnabled, apply, mutate, sections]);

  return (
    <div ref={rootRef} className="relative">
      <PageBuilder sections={sections} />
      {isVisualEditingEnabled && (
        <div className="fixed z-[60] w-full bottom-4 inset-x-0 p-4 flex justify-center items-center gap-2">
          {/* Opens the page blocks builder — the versioned entry point for M2A content on pages. */}
          <Button
            id="visual-editing-button"
            variant="secondary"
            className="visual-editing-button-class"
            data-directus={setAttr({
              collection: 'pages',
              item: getPageIdForEditing(),
              fields: ['blocks', 'meta_m2a_button'],
              mode: 'modal',
            })}
          >
            <Pencil className="size-4 mr-2" />
            Edit All Blocks
          </Button>
        </div>
      )}
      <style>
        {`/* Safe to remove this if you're not using the visual editor. */
          .directus-visual-editing-overlay.visual-editing-button-class .directus-visual-editing-edit-button {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            transform: none;
            background: transparent;
          }
          .directus-visual-editing-overlay.visual-editing-button-class {
            opacity: 0 !important;
            z-index: 70 !important;
          }
          .directus-visual-editing-overlay {
            z-index: 40 !important;
          }
        `}
      </style>
    </div>
  );
}
