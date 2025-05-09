import React from 'react';
import { cn } from '@/lib/utils';

export interface TextProps {
  content: string;
  className?: string;
  'data-directus'?: string;
}

const Text = ({ content, className, 'data-directus': dataDirectus }: TextProps) => {
  return (
    <div
      className={cn(
        'prose dark:prose-invert text-foreground prose-img:rounded-lg prose-img:border-2 prose-img:border-gray-500 prose-headings:font-display',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: content }}
      data-directus={dataDirectus}
    />
  );
};

export default Text;
