import { fetchPageData } from '@/lib/directus/fetchers';
import { PageBlock, Redirect } from '@/types/directus-schema';
import { notFound, redirect } from 'next/navigation';
import PageClient from './PageClient';

interface RedirectError {
	type: 'redirect';
	destination: string;
	status: NonNullable<Redirect['response_code']>;
}

function isRedirectError(error: unknown): error is RedirectError {
	return (
		typeof error === 'object' &&
		error !== null &&
		'type' in error &&
		error.type === 'redirect' &&
		'destination' in error &&
		typeof error.destination === 'string' &&
		'status' in error &&
		(error.status === '301' || error.status === '302')
	);
}

export async function generateMetadata({ params }: { params: Promise<{ permalink?: string[] }> }) {
	const { permalink } = await params;
	const permalinkSegments = permalink || [];
	const resolvedPermalink = `/${permalinkSegments.join('/')}`.replace(/\/$/, '') || '/';

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
		if (isRedirectError(error)) {
			// For both 301 and 302 redirects, we just use the destination
			// The status code is handled by the server response
			redirect(error.destination);
		}

		console.error('Error loading page metadata:', error);

		return;
	}
}

export default async function Page({ params }: { params: Promise<{ permalink?: string[] }> }) {
	const { permalink } = await params;
	const permalinkSegments = permalink || [];
	const resolvedPermalink = `/${permalinkSegments.join('/')}`.replace(/\/$/, '') || '/';

	try {
		const page = await fetchPageData(resolvedPermalink);

		if (!page || !page.blocks) {
			notFound();
		}

		const blocks: PageBlock[] = page.blocks.filter(
			(block: any): block is PageBlock => typeof block === 'object' && block.collection,
		);

		return <PageClient sections={blocks} pageId={page.id} />;
	} catch (error) {
		// Handle redirect
		if (isRedirectError(error)) {
			redirect(error.destination);
		}

		console.error('Error loading page:', error);
		notFound();
	}
}
