import { fetchPageData, fetchPageDataById, getPageIdByPermalink } from '@/lib/directus/fetchers';
import { PageBlock, type Page } from '@/types/directus-schema';
import { notFound } from 'next/navigation';
import PageClient from './PageClient';

export async function generateMetadata({
	params,
	searchParams,
}: {
	params: Promise<{ permalink?: string[] }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const { permalink } = await params;
	const searchParamsResolved = await searchParams;
	const permalinkSegments = permalink || [];
	const resolvedPermalink = `/${permalinkSegments.join('/')}`.replace(/\/$/, '') || '/';

	const preview = searchParamsResolved.preview === 'true';
	const version = typeof searchParamsResolved.version === 'string' ? searchParamsResolved.version : '';

	if (preview || version) {
		return {
			title: 'Preview Mode',
			description: 'Content preview',
		};
	}

	try {
		const page = await fetchPageData(resolvedPermalink);

		if (!page) return;

		return {
			title: page.seo?.title ?? page.title ?? '',
			description: page.seo?.meta_description ?? '',
			openGraph: {
				title: page.seo?.title ?? page.title ?? '',
				description: page.seo?.meta_description ?? '',
				url: `${process.env.NEXT_PUBLIC_SITE_URL}${resolvedPermalink}`,
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
	const permalinkSegments = permalink || [];
	const resolvedPermalink = `/${permalinkSegments.join('/')}`.replace(/\/$/, '') || '/';

	const id = typeof searchParamsResolved.id === 'string' ? searchParamsResolved.id : '';
	const version = typeof searchParamsResolved.version === 'string' ? searchParamsResolved.version : '';
	const preview = searchParamsResolved.preview === 'true';
	const token = typeof searchParamsResolved.token === 'string' ? searchParamsResolved.token : '';

	try {
		let pageId = id;
		if (version && !pageId) {
			const foundPageId = await getPageIdByPermalink(resolvedPermalink, token || undefined);
			pageId = foundPageId || '';
		}

		let page;
		if (pageId && version) {
			page = await fetchPageDataById(pageId, version, token || undefined);
		} else if (version && !pageId) {
			page = await fetchPageData(resolvedPermalink, 1, token || undefined, preview);
		} else {
			page = await fetchPageData(resolvedPermalink, 1, token || undefined, preview);
		}

		if (!page || !page.blocks) {
			notFound();
		}

		const blocks: PageBlock[] = (page.blocks as PageBlock[]).filter(
			(block): block is PageBlock => typeof block === 'object' && !!block.collection && !block.hide_block,
		);

		return <PageClient sections={blocks} pageId={page.id} />;
	} catch (error) {
		console.error('Error loading page:', error);
		notFound();
	}
}
