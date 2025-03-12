import React from "react";

interface TaglineProps {
  tagline?: string | null;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
}

const Tagline = ({
  tagline,
  className = "",
  as: Component = "h2",
}: TaglineProps) => {
  if (!tagline) return null;

  return (
    <Component
      className={`font-heading text-accent font-normal uppercase text-lg md:text-xl lg:text-tagline ${className}`}
    >
      {tagline}
    </Component>
  );
};

export default Tagline;
