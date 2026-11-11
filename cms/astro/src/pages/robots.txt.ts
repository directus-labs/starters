// Allow all crawlers and point them at the sitemap (src/pages/sitemap.xml.ts), matching the other CMS frontends.
export function GET() {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL;
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${siteUrl}/sitemap.xml`, ''].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
