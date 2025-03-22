'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Tagline from '../ui/Tagline';
import Headline from '@/components/ui/Headline';
import Text from '@/components/ui/Text';
import { setAttr, useDirectusVisualEditing } from '@/lib/directus/visual-editing-helper';

interface RichTextProps {
	data: {
		tagline?: string;
		headline?: string;
		content: string;
		alignment?: 'left' | 'center' | 'right';
	};
	className?: string;
	itemId?: string;
}

const RichText = ({ data, className, itemId }: RichTextProps) => {
	const richTextData = useDirectusVisualEditing(data, itemId, 'block_richtext');
	const { tagline, headline, content, alignment = 'left' } = richTextData;

	const router = useRouter();

	useEffect(() => {
		const container = document.querySelector('.prose');
		const links = container?.querySelectorAll('a');

		links?.forEach((link) => {
			const href = link.getAttribute('href');
			if (href && href.startsWith('/')) {
				link.onclick = (event) => {
					event.preventDefault();
					router.push(href);
				};
			}
		});

		const iframes = container?.querySelectorAll('iframe');
		iframes?.forEach((iframe) => {
			const wrapper = document.createElement('div');
			wrapper.className = 'relative aspect-video';
			iframe.parentNode?.insertBefore(wrapper, iframe);
			wrapper.appendChild(iframe);

			iframe.style.position = 'absolute';
			iframe.style.top = '0';
			iframe.style.left = '0';
			iframe.style.width = '100%';
			iframe.style.height = '100%';
		});
	}, [content, router]);

	return (
		<div
			className={cn(
				'mx-auto max-w-[600px] space-y-6',
				alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left',
				className,
			)}
		>
			{tagline && (
				<Tagline
					tagline={tagline}
					data-directus={
						itemId
							? setAttr({
									collection: 'block_richtext',
									item: itemId,
									fields: 'tagline',
									mode: 'popover',
								})
							: undefined
					}
				/>
			)}
			{headline && (
				<Headline
					headline={headline}
					data-directus={
						itemId
							? setAttr({
									collection: 'block_richtext',
									item: itemId,
									fields: 'headline',
									mode: 'popover',
								})
							: undefined
					}
				/>
			)}
			<Text
				content={content}
				data-directus={
					itemId
						? setAttr({
								collection: 'block_richtext',
								item: itemId,
								fields: 'content',
								mode: 'popover',
							})
						: undefined
				}
			/>
		</div>
	);
};

export default RichText;
