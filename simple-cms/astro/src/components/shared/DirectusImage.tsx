import React from "react";
import { getDirectusAssetURL } from "@/lib/directus/directus-utils";

export interface DirectusImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  uuid: string;
  fill?: boolean;
}

const DirectusImage: React.FC<DirectusImageProps> = ({
  uuid,
  alt,
  width,
  height,
  fill,
  style,
  ...rest
}) => {
  const src = getDirectusAssetURL(uuid);

  if (fill) {
    const fillStyle: React.CSSProperties = {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      ...style,
    };
    return <img src={src} alt={alt} style={fillStyle} {...rest} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={style}
      {...rest}
    />
  );
};

export default DirectusImage;
