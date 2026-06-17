'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Button from '@/components/blocks/Button';
import { CheckCircle2 } from 'lucide-react';
import { getIsDraftPreview, setBlockAttr } from '@/lib/directus/visualEditing';

export interface PricingCardProps {
	card: {
		id: string;
		title: string;
		description?: string;
		price?: string;
		badge?: string;
		features?: string[];
		button?: {
			id: string;
			label: string | null;
			variant: string | null;
			url: string | null;
		};
		is_highlighted?: boolean;
	};
}

const PricingCard = ({ card }: PricingCardProps) => {
	const isDraftPreview = getIsDraftPreview();

	// Published: target the card item. Draft: pageFields gives setBlockAttr the nested M2A path.
	const pricingCardField = (field: string) =>
		setBlockAttr({
			blockCollection: 'block_pricing_cards',
			blockItemId: card.id,
			pageFields: `blocks.item:block_pricing.pricing_cards.${field}`,
			fields: [field],
			mode: 'popover',
		});

	return (
		<div
			className={`flex flex-col max-w-[600px] md:min-h-[424px] border rounded-lg p-6 ${
				card.is_highlighted ? 'border-accent' : 'border-input'
			}`}
		>
			<div className="flex justify-between items-start gap-2 mb-4">
				<h3 className="text-xl font-heading text-foreground" data-directus={pricingCardField('title')}>
					{card.title}
				</h3>
				<div className="flex-shrink-0">
					{card.badge && (
						<Badge
							variant={card.is_highlighted ? 'secondary' : 'default'}
							className="text-xs font-medium uppercase"
							data-directus={pricingCardField('badge')}
						>
							{card.badge}
						</Badge>
					)}
				</div>
			</div>
			{card.price && (
				<p className="text-h2 mt-2 font-semibold" data-directus={pricingCardField('price')}>
					{card.price}
				</p>
			)}
			{card.description && (
				<p className="text-description mt-2 line-clamp-2" data-directus={pricingCardField('description')}>
					{card.description}
				</p>
			)}

			<Separator className="my-4" />

			<div className="flex-grow">
				{card.features && Array.isArray(card.features) && (
					<ul className="space-y-4" data-directus={pricingCardField('features')}>
						{card.features.map((feature, index) => (
							<li key={index} className="flex items-center gap-3 text-regular">
								<div className="mt-1">
									<CheckCircle2 className="size-4 text-gray-muted" />
								</div>
								<p className="leading-relaxed">{feature}</p>
							</li>
						))}
					</ul>
				)}
			</div>
			<div className="mt-auto pt-4">
				{card.button && (
					<Button
						id={card.button.id}
						data-directus={setBlockAttr(
							isDraftPreview
								? {
										blockCollection: 'block_pricing',
										blockItemId: card.id,
										pageFields: 'blocks.item:block_pricing.pricing_cards.button',
										fields: ['type', 'label', 'variant', 'url', 'page', 'post'],
										mode: 'popover',
									}
								: {
										blockCollection: 'block_button',
										blockItemId: card.button.id,
										fields: ['type', 'label', 'variant', 'url', 'page', 'post'],
										mode: 'popover',
									},
						)}
						label={card.button.label}
						variant={card.button.variant}
						url={card.button.url}
						block={true}
					/>
				)}
			</div>
		</div>
	);
};

export default PricingCard;
