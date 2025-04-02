'use client';

import useSWR from 'swr';
import { useEffect } from 'react';
import { useVisualEditing } from '@/hooks/useVisualEditing';
import PageBuilder from '@/components/layout/PageBuilder';
import type { PageBlock } from '@/types/directus-schema';

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

  return <PageBuilder sections={sections} />;
}
