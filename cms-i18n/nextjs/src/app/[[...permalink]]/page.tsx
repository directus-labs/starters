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

	// Skip metadata generation for preview content
	if (preview) {
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
	const token = preview ? process.env.DIRECTUS_SERVER_TOKEN : undefined;
	// version=published is the live key in Directus v12+; version=main was used by older Directus versions.
	// Both represent published content and don't require an explicit version parameter.
	// Versions are only read in preview mode; without preview=true, fall back to published content.
	const fixedVersion = !preview || version === 'published' || version === 'main' ? undefined : version;

	const locale = await getLocaleFromHeaders();

	try {
		let page: Page;

		// Version-specific content handling:
		// When a non-published version is requested (e.g., "draft"), we need to:
		// 1. Look up the page ID by permalink if not provided directly
		// 2. Fetch the specific version of that page
		// 3. Fail gracefully if the page doesn't exist for that version
		if (fixedVersion && id) {
			// We have both ID and version - fetch the specific version
			page = await fetchPageDataById(id, fixedVersion, token, locale);
		} else if (fixedVersion && !id) {
			// We have version but no ID - look up the page ID first
			const pageId = await getPageIdByPermalink(resolvedPermalink, token);
			if (!pageId) {
				notFound();
			}
			page = await fetchPageDataById(pageId, fixedVersion, token, locale);
		} else {
			page = await fetchPageData(resolvedPermalink, 1, locale, token, preview);
		}

		if (!page || !page.blocks) {
			notFound();
		}

		const blocks: PageBlock[] = (page.blocks as PageBlock[]) || [];

		return <PageClient sections={blocks} pageId={page.id} contentVersion={fixedVersion} />;
	} catch (error) {
		console.error('Error loading page:', error);
		notFound();
	}
}
