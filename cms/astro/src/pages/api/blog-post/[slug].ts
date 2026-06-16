export const prerender = false;
import type { APIRoute } from 'astro';
import { fetchPostBySlug, fetchPostByIdAndVersion, getPostIdBySlug } from '@/lib/directus/fetchers';

export const GET: APIRoute = async ({ request }) => {
  const { pathname, searchParams } = new URL(request.url);

  const slug = pathname.replace('/api/blog-post/', '').trim();
  const id = searchParams.get('id');
  // Live preview sends version=published (Directus v12+) or version=main (older Directus versions) for live content.
  // Neither key requires an explicit version parameter — strip both to fetch the default published version.
  const rawVersion = searchParams.get('version') || '';
  const version = rawVersion !== 'main' && rawVersion !== 'published' ? rawVersion : null;
  const preview = searchParams.get('preview') === 'true';
  const isEditing = searchParams.get('visual-editing') === 'true';
  const token = preview ? import.meta.env.DIRECTUS_SERVER_TOKEN : undefined;

  // Only serve data for visual editing or live preview with an explicit version (draft/custom).
  // All other requests get an empty post so BlogPostClient falls back to initialPost.
  if (!isEditing && !(preview && !!version)) {
    return new Response(JSON.stringify({ post: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug' }), {
      status: 400,
    });
  }

  try {
    let postId = id;
    const isDraft = preview || (!!version && version !== 'published');

    if (version && !postId) {
      const foundPostId = await getPostIdBySlug(slug, token);
      postId = foundPostId || '';
    }

    let result;

    if (postId && version) {
      result = await fetchPostByIdAndVersion(postId, version, slug, token);
    } else {
      const post = await fetchPostBySlug(slug, isDraft, token);
      result = { post, relatedPosts: [] };
    }

    if (!result.post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Error loading post' }), {
      status: 500,
    });
  }
};
