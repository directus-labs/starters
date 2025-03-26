import { fetchPageData } from '@/lib/directus/fetchers';
import PageBuilder from '@/components/layout/PageBuilder';
import { PageBlock } from '@/types/directus-schema';
import AdminBar from '@/components/shared/AdminBar';

export async function generateMetadata({ params }: { params: Promise<{ permalink?: string[] }> }) {
	const { permalink } = await params;
	const permalinkSegments = permalink || [];
	let resolvedPermalink = `/${permalinkSegments.join('/')}`.replace(/\/$/, '') || '/';
	resolvedPermalink = resolvedPermalink.split('?')[0];

	try {
		const page = await fetchPageData(resolvedPermalink);

		if (!page) {
			return;
		}

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

export default async function Page({ params }: { params: Promise<{ permalink?: string[] }> }) {
	const { permalink } = await params;
	const permalinkSegments = permalink || [];
	let resolvedPermalink = `/${permalinkSegments.join('/')}`.replace(/\/$/, '') || '/';
	resolvedPermalink = resolvedPermalink.split('?')[0];

	let page;
	try {
		page = await fetchPageData(resolvedPermalink);
	} catch (error) {
		console.error('Error loading page:', error);
	}

	if (!page || !page.blocks) {
		return <div className="text-center text-xl mt-[20%]">404 - Page Not Found</div>;
	}

	const blocks: PageBlock[] = page.blocks.filter(
		(block: any): block is PageBlock => typeof block === 'object' && block.collection,
	);

	return (
		<>
			<AdminBar contentId={page.id} type="page" />
			<PageBuilder sections={blocks} />
		</>
	);
}
