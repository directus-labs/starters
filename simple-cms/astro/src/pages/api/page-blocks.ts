// src/pages/api/page-blocks.ts
import type { APIRoute } from 'astro';
import { fetchPageData } from '@/lib/directus/fetchers';

export const GET: APIRoute = async ({ url }) => {
  const permalink = url.searchParams.get('permalink') || '/';
  const isEditing = url.searchParams.get('visual-editing') === 'true';

  if (!isEditing) {
    return new Response(JSON.stringify({ blocks: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const page = await fetchPageData(permalink);

    const blocks = (page?.blocks ?? []).filter((block: any) => typeof block === 'object' && block.collection);

    return new Response(JSON.stringify({ blocks }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to load blocks' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
