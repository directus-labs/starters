import React from 'react';

interface TitleProps {
  tagline?: string | null;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  'data-directus'?: string;
}

const Tagline = ({ tagline, className = '', as: Component = 'h2', 'data-directus': dataDirectus }: TitleProps) => {
  if (!tagline) return null;

  return (
    <Component
      className={`font-heading text-accent font-normal uppercase ${className}
         text-lg md:text-xl lg:text-tagline`}
      data-directus={dataDirectus}
    >
      {tagline}
    </Component>
  );
};

export default Tagline;
