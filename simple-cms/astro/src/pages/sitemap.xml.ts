import { fetchAllPages, fetchAllPosts } from '@/lib/directus/fetchers';

export async function GET() {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL;

  if (!siteUrl) {
    throw new Error('Environment variable PUBLIC_SITE_URL is not set');
  }

  try {
    const [pages, posts] = await Promise.all([fetchAllPages(), fetchAllPosts()]);

    const pageUrls = pages.map((page) => ({
      url: `${siteUrl}${page.permalink}`,
      lastModified: page.published_at || new Date().toISOString(),
    }));

    const postUrls = posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.published_at || new Date().toISOString(),
    }));

    const sitemapEntries = [...pageUrls, ...postUrls]
      .map(
        (entry) => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
  </url>`,
      )
      .join('');

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>`;

    return new Response(sitemapXml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch {
    return new Response('Failed to generate sitemap', { status: 500 });
  }
}
