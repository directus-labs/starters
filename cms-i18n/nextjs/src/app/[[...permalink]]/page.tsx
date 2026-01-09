import { fetchPageData, fetchPageDataById, getPageIdByPermalink } from '@/lib/directus/fetchers';
import { PageBlock, type Page } from '@/types/directus-schema';
import { notFound } from 'next/navigation';
import PageClient from './PageClient';
import { getLocaleFromHeaders, getLanguagesFromDirectus } from '@/lib/i18n/server';
import { addLocaleToPath, resolvePermalink } from '@/lib/i18n/utils';

/**
 * Generates page metadata with locale-specific content and alternate language links.
 */
export async function generateMetadata({
	params,
	searchParams,
}: {
	params: Promise<{ permalink?: string[] }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const { permalink } = await params;
	const searchParamsResolved = await searchParams;
	const resolvedPermalink = resolvePermalink(permalink);

	const preview = searchParamsResolved.preview === 'true';
	const version = typeof searchParamsResolved.version === 'string' ? searchParamsResolved.version : '';

	// Skip metadata generation for preview/versioned content
	if (preview || version) {
		return {
			title: 'Preview Mode',
			description: 'Content preview',
		};
	}

	const locale = await getLocaleFromHeaders();

	try {
		const page = await fetchPageData(resolvedPermalink, 1, locale);

		if (!page) return;

		const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
		const localizedPath = addLocaleToPath(resolvedPermalink, locale);

		const { languages } = await getLanguagesFromDirectus();
		const supportedLocales = languages.map((lang) => lang.code);
		const alternates: Record<string, string> = {};
		for (const altLocale of supportedLocales) {
			const altPath = addLocaleToPath(resolvedPermalink, altLocale);
			alternates[`${altLocale}`] = `${siteUrl}${altPath}`;
		}

		return {
			title: page.seo?.title ?? page.title ?? '',
			description: page.seo?.meta_description ?? '',
			alternates: {
				languages: alternates,
			},
			openGraph: {
				title: page.seo?.title ?? page.title ?? '',
				description: page.seo?.meta_description ?? '',
				url: `${siteUrl}${localizedPath}`,
				type: 'website',
			},
		};
	} catch (error) {
		console.error('Error loading page metadata:', error);

		return;
	}
}

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ permalink?: string[] }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const { permalink } = await params;
	const searchParamsResolved = await searchParams;
	const resolvedPermalink = resolvePermalink(permalink);

	const id = typeof searchParamsResolved.id === 'string' ? searchParamsResolved.id : '';
	const version = typeof searchParamsResolved.version === 'string' ? searchParamsResolved.version : '';
	const preview = searchParamsResolved.preview === 'true';
	const token = typeof searchParamsResolved.token === 'string' ? searchParamsResolved.token : '';
	// Live preview adds version = main which is not required when fetching the main version.
	const fixedVersion = version != 'main' ? version : undefined;

	const locale = await getLocaleFromHeaders();

	try {
		let page: Page;

		// Version-specific content handling:
		// When a version is requested (e.g., "draft", "published"), we need to:
		// 1. Look up the page ID by permalink if not provided directly
		// 2. Fetch the specific version of that page
		// 3. Fail gracefully if the page doesn't exist for that version
		if (fixedVersion && id) {
			// We have both ID and version - fetch the specific version
			page = await fetchPageDataById(id, fixedVersion, token || undefined, locale);
		} else if (fixedVersion && !id) {
			// We have version but no ID - look up the page ID first
			const pageId = await getPageIdByPermalink(resolvedPermalink, token || undefined);
			if (!pageId) {
				notFound();
			}
			page = await fetchPageDataById(pageId, fixedVersion, token || undefined, locale);
		} else {
			page = await fetchPageData(resolvedPermalink, 1, locale, token || undefined, preview);
		}

		if (!page || !page.blocks) {
			notFound();
		}

		const blocks: PageBlock[] = (page.blocks as PageBlock[]) || [];

		return <PageClient sections={blocks} pageId={page.id} />;
	} catch (error) {
		console.error('Error loading page:', error);
		notFound();
	}
}
