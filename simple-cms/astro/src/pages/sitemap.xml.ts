import { useDirectus } from "@/lib/directus/directus";

export async function GET() {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL;
  if (!siteUrl) {
    throw new Error("Environment variable PUBLIC_SITE_URL is not set");
  }

  const { directus, readItems } = useDirectus();

  try {
    const pagesPromise = directus.request(
      readItems("pages", {
        filter: { status: { _eq: "published" } },
        fields: ["permalink", "published_at"],
        limit: -1,
      })
    );

    const postsPromise = directus.request(
      readItems("posts", {
        filter: { status: { _eq: "published" } },
        fields: ["slug", "published_at"],
        limit: -1,
      })
    );

    const [pages, posts] = await Promise.all([pagesPromise, postsPromise]);

    const pageUrls = pages
      .filter(
        (page: { permalink: string; published_at?: string | null }) =>
          page.permalink
      )
      .map((page: { permalink: string; published_at?: string | null }) => ({
        url: `${siteUrl}${page.permalink}`,
        lastModified: page.published_at || new Date().toISOString(),
      }));

    const postUrls = posts
      .filter(
        (post: { slug?: string | null; published_at?: string | null }) =>
          post.slug
      )
      .map((post: { slug?: string | null; published_at?: string | null }) => ({
        url: `${siteUrl}/blog/${post.slug}`,
        lastModified: post.published_at || new Date().toISOString(),
      }));

    const urls = [...pageUrls, ...postUrls];

    const sitemapEntries = urls
      .map(
        (entry) => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
  </url>`
      )
      .join("");

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>`;

    return new Response(sitemapXml, {
      headers: { "Content-Type": "application/xml" },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response("Failed to generate sitemap", { status: 500 });
  }
}
