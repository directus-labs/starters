import type { APIRoute } from 'astro';
import { fetchSiteData } from '@/lib/directus/fetchers';

export const GET: APIRoute = async ({ url }) => {
  const isEditing = url.searchParams.get('visual-editing') === 'true';

  if (!isEditing) {
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const siteData = await fetchSiteData();
    return new Response(JSON.stringify(siteData), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to fetch site data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
