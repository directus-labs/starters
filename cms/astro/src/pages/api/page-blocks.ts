import type { APIRoute } from 'astro';
import { fetchPageData, fetchPageDataById, getPageIdByPermalink } from '@/lib/directus/fetchers';
export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const permalink = url.searchParams.get('permalink') || '/';
  const id = url.searchParams.get('id');
  // Live preview adds version = main which is not required when fetching the main version.
  const rawVersion = url.searchParams.get('version') || '';
  const version = rawVersion !== 'main' ? rawVersion : null;
  const preview = url.searchParams.get('preview') === 'true';
  const token = preview ? import.meta.env.DIRECTUS_SERVER_TOKEN : undefined;

  try {
    let page;
    let pageId = id;

    if (version && !pageId) {
      const foundPageId = await getPageIdByPermalink(permalink, token, preview);
      pageId = foundPageId || '';
    }

    if (pageId && version) {
      page = await fetchPageDataById(pageId, version, token);
    } else {
      page = await fetchPageData(permalink, 1, token, preview);
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
