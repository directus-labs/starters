import Tagline from '@/components/ui/Tagline';
import Headline from '@/components/ui/Headline';
import PricingCard from '@/components/blocks/PricingCard';
import { setAttr } from '@directus/visual-editing';

interface PricingCardType {
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
}

interface PricingData {
  id: string;
  tagline?: string;
  headline?: string;
  pricing_cards: PricingCardType[];
}

interface PricingProps {
  data: PricingData;
}

const Pricing = ({ data }: PricingProps) => {
  const { id, tagline, headline, pricing_cards } = data;

  if (!pricing_cards || !Array.isArray(pricing_cards)) {
    return null;
  }

  const gridClasses = (() => {
    if (pricing_cards.length === 1) return 'grid-cols-1';
    if (pricing_cards.length % 3 === 0) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

    return 'grid-cols-1 sm:grid-cols-2';
  })();

  return (
    <section>
      {tagline && (
        <Tagline
          tagline={tagline}
          data-directus={setAttr({
            collection: 'block_pricing',
            item: id,
            fields: 'tagline',
            mode: 'popover',
          })}
        />
      )}
      {headline && (
        <Headline
          headline={headline}
          data-directus={setAttr({
            collection: 'block_pricing',
            item: id,
            fields: 'headline',
            mode: 'popover',
          })}
        />
      )}
      <div
        className={`grid gap-6 mt-8 ${gridClasses}`}
        data-directus={setAttr({
          collection: 'block_pricing',
          item: id,
          fields: ['pricing_cards'],
          mode: 'modal',
        })}
      >
        {pricing_cards.map((card) => (
          <PricingCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
};

export default Pricing;
