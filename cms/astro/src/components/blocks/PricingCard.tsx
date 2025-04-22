import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Button from '@/components/blocks/Button';
import { CheckCircle2 } from 'lucide-react';
import { setAttr } from '@directus/visual-editing';
import type { VariantProps } from 'class-variance-authority';
import type { buttonVariants } from '@/components/ui/button';

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
  return (
    <div
      className={`flex flex-col max-w-[600px] md:min-h-[424px] border rounded-lg p-6 ${
        card.is_highlighted ? 'border-accent' : 'border-input'
      }`}
    >
      <div className="flex justify-between items-start gap-2 mb-4">
        <h3
          className="text-xl font-heading text-foreground"
          data-directus={setAttr({
            collection: 'block_pricing_cards',
            item: card.id,
            fields: ['title'],
            mode: 'popover',
          })}
        >
          {card.title}
        </h3>
        <div className="flex-shrink-0">
          {card.badge && (
            <Badge
              variant={card.is_highlighted ? 'secondary' : 'default'}
              className="text-xs font-medium uppercase"
              data-directus={setAttr({
                collection: 'block_pricing_cards',
                item: card.id,
                fields: ['badge'],
                mode: 'popover',
              })}
            >
              {card.badge}
            </Badge>
          )}
        </div>
      </div>
      {card.price && (
        <p
          className="text-h2 mt-2 font-semibold"
          data-directus={setAttr({
            collection: 'block_pricing_cards',
            item: card.id,
            fields: ['price'],
            mode: 'popover',
          })}
        >
          {card.price}
        </p>
      )}
      {card.description && (
        <p
          className="text-description mt-2 line-clamp-2"
          data-directus={setAttr({
            collection: 'block_pricing_cards',
            item: card.id,
            fields: ['description'],
            mode: 'popover',
          })}
        >
          {card.description}
        </p>
      )}

      <Separator className="my-4" />

      <div className="flex-grow">
        {card.features && Array.isArray(card.features) && (
          <ul
            className="space-y-4"
            data-directus={setAttr({
              collection: 'block_pricing_cards',
              item: card.id,
              fields: ['features'],
              mode: 'popover',
            })}
          >
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
            data-directus={setAttr({
              collection: 'block_button',
              item: card.button.id,
              fields: ['type', 'label', 'variant', 'url', 'page', 'post'],
              mode: 'popover',
            })}
            label={card.button.label}
            variant={
              ['link', 'default', 'destructive', 'outline', 'secondary', 'ghost'].includes(card.button.variant || '')
                ? (card.button.variant as VariantProps<typeof buttonVariants>['variant'])
                : 'default'
            }
            url={card.button.url}
            block={true}
          />
        )}
      </div>
    </div>
  );
};

export default PricingCard;
