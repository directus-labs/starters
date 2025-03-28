import React from 'react';
import Form from './Form';
import Gallery from './Gallery';
import Posts from './Posts';
import Hero from './Hero';
import RichText from './RichText';
import Pricing from './Pricing';
import type { PageBlock } from '@/types/directus-schema';
import { setAttr } from '@directus/visual-editing';

interface BaseBlockProps {
  block: PageBlock;
}

export default function BaseBlock({ block }: BaseBlockProps) {
  if (!block.collection || !block.item) return null;

  const components: Record<string, React.ElementType> = {
    block_hero: Hero,
    block_gallery: Gallery,
    block_posts: Posts,
    block_form: Form,
    block_richtext: RichText,
    block_pricing: Pricing,
  };

  const Component = components[block.collection];

  const itemId =
    typeof block.item === 'object' && block.item !== null && 'id' in block.item ? (block.item.id as string) : undefined;

  return Component ? (
    <div
      className="relative"
      data-directus={setAttr({
        collection: 'page_blocks',
        item: block.id,
        fields: ['item', 'collection', 'background', 'hide_block'],
        mode: 'modal',
      })}
    >
      <Component data={block.item} blockId={block.id} itemId={itemId} />
    </div>
  ) : null;
}
