export const prerender = false;
import type { APIRoute } from 'astro';
import { fetchPostBySlug } from '@/lib/directus/fetchers';

export const GET: APIRoute = async ({ request }) => {
  const { pathname, searchParams } = new URL(request.url);

  const slug = pathname.replace('/api/blog-post/', '').trim();
  const token = searchParams.get('token');
  const isEditing = searchParams.get('visual-editing') === 'true';

  if (!isEditing) {
    return new Response(JSON.stringify({ post: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });
  }

  try {
    const post = await fetchPostBySlug(slug, true, token || undefined);

    if (!post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ post }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Error loading post' }), { status: 500 });
  }
};
