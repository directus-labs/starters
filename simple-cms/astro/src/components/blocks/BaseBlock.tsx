import React from 'react';
import Form from './Form';
import Gallery from './Gallery';
import Posts from './Posts';
import Hero from './Hero';
import type { PageBlock } from '@/types/directus-schema';
import { setAttr } from '@/lib/directus/visual-editing-helper';
import DirectusVisualEditing from '@/components/shared/DirectusVisualEditing';

interface BaseBlockProps {
  block: PageBlock;
}

export default function BaseBlockReact({ block }: BaseBlockProps) {
  if (!block.collection || !block.item) return null;

  const components: Record<string, React.ElementType> = {
    block_hero: Hero,
    block_gallery: Gallery,
    block_posts: Posts,
    block_form: Form,
  };

  const Component = components[block.collection];

  const itemId = block.item?.id;

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
      <DirectusVisualEditing />
      <Component data={block.item} blockId={block.id} itemId={itemId} />
    </div>
  ) : null;
}
