import React from "react";

interface HeadlineProps {
  headline?: string | null;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
}

const Headline = ({
  headline,
  className = "",
  as: Component = "p",
}: HeadlineProps) => {
  if (!headline) return null;

  return (
    <Component
      className={`font-heading text-foreground font-normal text-4xl md:text-5xl lg:text-headline ${className}`}
    >
      {headline}
    </Component>
  );
};

export default Headline;
