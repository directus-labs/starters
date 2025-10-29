'use client';

import useSWR from 'swr';
import { useEffect, useState } from 'react';
import { useVisualEditing } from '@/hooks/useVisualEditing';
import PageBuilder from '@/components/layout/PageBuilder';
import type { PageBlock } from '@/types/directus-schema';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { setAttr } from '@directus/visual-editing';

interface PageClientProps {
  initialSections: PageBlock[];
  permalink: string;
  pageId: string;
}

interface VisualEditingOptions {
  customClass?: string;
  onSaved?: () => void;
  elements?: HTMLElement;
}

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

  const [isPreviewEnabled, setIsPreviewEnabled] = useState(false);
  const [hasVersioningParams, setHasVersioningParams] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsPreviewEnabled(params.get('preview') === 'true');
    setHasVersioningParams(!!params.get('version') || !!params.get('id'));
  }, []);

  const shouldFetchLive = isVisualEditingEnabled || isPreviewEnabled || hasVersioningParams;
  const swrKey = shouldFetchLive ? `${permalink}-${new URLSearchParams(window.location.search).toString()}` : null;

  const { data: sections = initialSections, mutate } = useSWR(
    swrKey,
    () => fetchBlocks(permalink, new URLSearchParams(window.location.search)),
    {
      fallbackData: initialSections,
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (isVisualEditingEnabled) {
      apply({
        onSaved: () => {
          mutate();
        },
      } as VisualEditingOptions);

      apply({
        elements: document.querySelector('#visual-editing-button') as HTMLElement,
        customClass: 'visual-editing-button-class',
        onSaved: () => {
          mutate();
        },
      } as VisualEditingOptions);
    }
  }, [isVisualEditingEnabled, apply, mutate]);

  return (
    <div className="relative">
      <PageBuilder sections={sections} />
      {isVisualEditingEnabled && (
        <div className="fixed z-50 w-full bottom-4 inset-x-0 p-4 flex justify-center items-center gap-2">
          <Button
            id="visual-editing-button"
            variant="secondary"
            className="visual-editing-button-class"
            data-directus={setAttr({
              collection: 'pages',
              item: pageId,
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
        `}
      </style>
    </div>
  );
}
