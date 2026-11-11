import type { MetadataRoute } from 'next';

// Allow all crawlers and point them at the sitemap (src/app/sitemap.ts), matching the other CMS frontends.
export default function robots(): MetadataRoute.Robots {
	return {
		rules: { userAgent: '*', allow: '/' },
		sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
	};
}
