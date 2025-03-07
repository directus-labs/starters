import React from "react";
import Form from "./Form";
import Gallery from "./Gallery";
import Hero from "./Hero";
import Posts from "./Posts";
import Pricing from "./Pricing";
import RichText from "./RichText";

interface BaseBlockProps {
  block: {
    collection: string;
    item: any;
    id: string;
  };
}
export default function BaseBlock({ block }: BaseBlockProps) {
  const components: Record<string, React.ElementType> = {
    block_hero: Hero,
    block_richtext: RichText,
    block_gallery: Gallery,
    block_pricing: Pricing,
    block_posts: Posts,
    block_form: Form,
  };
  const Component = components[block.collection];
  if (!Component) return null;
  return <Component data={block.item} id={`block-${block.id}`} />;
}
