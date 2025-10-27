import type { APIRoute } from 'astro';
import { fetchPageData, fetchPageDataById, getPageIdByPermalink } from '@/lib/directus/fetchers';
export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const permalink = url.searchParams.get('permalink') || '/';
  const id = url.searchParams.get('id');
  const version = url.searchParams.get('version');
  const preview = url.searchParams.get('preview') === 'true';
  const token = url.searchParams.get('token');

  try {
    let page;
    let pageId = id;

    if (version && !pageId) {
      const foundPageId = await getPageIdByPermalink(permalink, token || undefined, preview);
      pageId = foundPageId || '';
    }

    if (pageId && version) {
      page = await fetchPageDataById(pageId, version, token || undefined);
    } else {
      page = await fetchPageData(permalink, 1, token || undefined, preview);
    }

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
