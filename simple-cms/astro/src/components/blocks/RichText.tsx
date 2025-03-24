import React from 'react';
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

  return (
    <div className={`mx-auto max-w-[600px] space-y-6 text-${alignment} ${className}`}>
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
