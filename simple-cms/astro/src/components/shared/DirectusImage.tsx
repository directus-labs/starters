import React from 'react';
import { getDirectusAssetURL } from '@/lib/directus/directus-utils';
import { cn } from '@/lib/utils';

export interface DirectusImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  uuid: string;
  fill?: boolean;
  width?: number;
  height?: number;
}

const DirectusImage: React.FC<DirectusImageProps> = ({
  uuid,
  alt = '',
  fill = false,
  width = 1200,
  height = 600,
  className = '',
  style,
  ...rest
}) => {
  const src = getDirectusAssetURL(uuid);

  if (fill) {
    return (
      <div className="absolute inset-0">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            ...style,
          }}
          className={cn('w-full h-full', className)}
          {...rest}
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={className}
      style={style}
      {...rest}
    />
  );
};

export default DirectusImage;
