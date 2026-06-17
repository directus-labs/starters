import Tagline from '@/components/ui/Tagline';
import Headline from '@/components/ui/Headline';
import Text from '@/components/ui/Text';
import { setBlockAttr } from '@/lib/directus/visualEditing';

interface RichTextProps {
  data: {
    id: string;
    tagline?: string;
    headline?: string;
    content?: string;
    alignment?: 'left' | 'center' | 'right';
  };
  className?: string;
}

const RichText = ({ data, className }: RichTextProps) => {
  const { id, tagline, headline, content, alignment = 'left' } = data;

  return (
    <div className={`mx-auto max-w-[600px] space-y-6 text-${alignment} ${className}`}>
      {tagline && (
        <Tagline
          tagline={tagline}
          data-directus={setBlockAttr({
            blockCollection: 'block_richtext',
            blockItemId: id,
            fields: 'tagline',
            mode: 'popover',
          })}
        />
      )}
      {headline && (
        <Headline
          headline={headline}
          data-directus={setBlockAttr({
            blockCollection: 'block_richtext',
            blockItemId: id,
            fields: 'headline',
            mode: 'popover',
          })}
        />
      )}
      {content && (
        <Text
          content={content}
          data-directus={setBlockAttr({
            blockCollection: 'block_richtext',
            blockItemId: id,
            fields: 'content',
            mode: 'drawer',
          })}
        />
      )}
    </div>
  );
};

export default RichText;
