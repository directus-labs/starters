'use client';

import useSWR from 'swr';
import { useEffect } from 'react';
import { useVisualEditing } from '@/hooks/useVisualEditing';
import PageBuilder from '@/components/layout/PageBuilder';
import type { PageBlock } from '@/types/directus-schema';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { setAttr } from '@directus/visual-editing';

interface PageClientProps {
  initialSections: PageBlock[];
  permalink: string;
}

const fetchBlocks = async (permalink: string): Promise<PageBlock[]> => {
  const res = await fetch(`/api/page-blocks?permalink=${encodeURIComponent(permalink)}`);
  if (!res.ok) throw new Error('Failed to fetch blocks');
  const data = await res.json();
  return data.blocks;
};

export default function PageClient({ initialSections, permalink }: PageClientProps) {
  const { isVisualEditingEnabled, apply } = useVisualEditing();

  const { data: sections = initialSections, mutate } = useSWR(
    isVisualEditingEnabled ? permalink : null,
    () => fetchBlocks(permalink),
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
      });
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
            data-directus={setAttr({
              collection: 'pages',
              item: permalink,
              fields: ['blocks', 'meta_m2a_button'],
              mode: 'modal',
            })}
          >
            <Pencil className="size-4 mr-2" />
            Edit All Blocks
          </Button>
        </div>
      )}
    </div>
  );
}
