import { PageBlock } from "@/types/directus-schema";

import BaseBlock from "../blocks/BaseBlock";
import React from "react";
import Container from "../ui/Container";

interface PageBuilderProps {
  sections: PageBlock[];
}
export default function PageBuilder({ sections }: PageBuilderProps) {
  const validBlocks = sections.filter(
    (block): block is PageBlock & { collection: string; item: object } =>
      typeof block.collection === "string" &&
      !!block.item &&
      typeof block.item === "object"
  );
  return (
    <div>
      {validBlocks.map((block) => (
        <div
          key={block.id}
          data-background={block.background}
          className="py-16"
        >
          <Container>
            <BaseBlock block={block} />
          </Container>
        </div>
      ))}
    </div>
  );
}
