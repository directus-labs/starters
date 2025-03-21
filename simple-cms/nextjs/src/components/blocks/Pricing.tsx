import Tagline from '@/components/ui/Tagline';
import Headline from '@/components/ui/Headline';
import PricingCard from '@/components/blocks/PricingCard';
import { setAttr } from '@/lib/directus/visual-editing-utils';

interface PricingProps {
	data: {
		tagline?: string;
		headline?: string;
		pricing_cards: Array<{
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
		}>;
	};
	itemId?: string;
}

const Pricing = ({ data, itemId }: PricingProps) => {
	const { tagline, headline, pricing_cards } = data;

	if (!pricing_cards || !Array.isArray(pricing_cards)) {
		return null;
	}

	const gridClasses = (() => {
		if (pricing_cards.length === 1) return 'grid-cols-1';
		if (pricing_cards.length % 3 === 0) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

		// Default to 2 columns for pricing cards
		return 'grid-cols-1 sm:grid-cols-2';
	})();

	return (
		<section>
			{tagline && (
				<Tagline
					tagline={tagline}
					data-directus={
						itemId
							? setAttr({
									collection: 'block_pricing',
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
									collection: 'block_pricing',
									item: itemId,
									fields: 'headline',
									mode: 'popover',
								})
							: undefined
					}
				/>
			)}

			<div
				className={`grid gap-6 mt-8 ${gridClasses}`}
				data-directus={
					itemId
						? setAttr({
								collection: 'block_pricing',
								item: itemId,
								fields: ['pricing_cards'],
								mode: 'modal',
							})
						: undefined
				}
			>
				{pricing_cards.map((card) => (
					<PricingCard key={card.id} card={card} />
				))}
			</div>
		</section>
	);
};

export default Pricing;
