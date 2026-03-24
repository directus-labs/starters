import Tagline from '@/components/ui/Tagline';
import Headline from '@/components/ui/Headline';
import Text from '@/components/ui/Text';
import { setAttr } from '@directus/visual-editing';

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
          data-directus={setAttr({
            collection: 'block_richtext',
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
            collection: 'block_richtext',
            item: id,
            fields: 'headline',
            mode: 'popover',
          })}
        />
      )}
      {content && (
        <Text
          content={content}
          data-directus={setAttr({
            collection: 'block_richtext',
            item: id,
            fields: 'content',
            mode: 'drawer',
          })}
        />
      )}
    </div>
  );
};

export default RichText;
