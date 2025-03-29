import type { APIRoute } from 'astro';
import { fetchSiteData } from '@/lib/directus/fetchers';

export const GET: APIRoute = async () => {
  try {
    const siteData = await fetchSiteData();
    return new Response(JSON.stringify(siteData), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch site data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
