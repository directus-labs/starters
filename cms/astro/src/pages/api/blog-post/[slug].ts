export const prerender = false;
import type { APIRoute } from 'astro';
import { fetchPostBySlug, fetchPostByIdAndVersion, getPostIdBySlug } from '@/lib/directus/fetchers';

export const GET: APIRoute = async ({ request }) => {
  const { pathname, searchParams } = new URL(request.url);

  const slug = pathname.replace('/api/blog-post/', '').trim();
  const token = searchParams.get('token');
  const id = searchParams.get('id');
  const version = searchParams.get('version');
  const preview = searchParams.get('preview') === 'true';
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
    let postId = id;
    const isDraft = (preview && !!token) || (!!version && version !== 'published') || !!token;

    if (version && !postId) {
      const foundPostId = await getPostIdBySlug(slug, token || undefined);
      postId = foundPostId || '';
    }

    let result;

    if (postId && version) {
      result = await fetchPostByIdAndVersion(postId, version, slug, token || undefined);
    } else {
      const post = await fetchPostBySlug(slug, isDraft, token || undefined);
      result = { post, relatedPosts: [] };
    }

    if (!result.post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Error loading post' }), { status: 500 });
  }
};
