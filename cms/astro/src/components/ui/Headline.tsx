import React from 'react';

interface HeadlineProps {
  headline?: string | null;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  'data-directus'?: string;
}

const Headline = ({ headline, className = '', as: Component = 'p', 'data-directus': dataDirectus }: HeadlineProps) => {
  if (!headline) return null;

  return (
    <Component
      className={`font-heading text-foreground font-normal ${className}
         text-4xl md:text-5xl lg:text-headline`}
      data-directus={dataDirectus}
    >
      {headline}
    </Component>
  );
};

export default Headline;
