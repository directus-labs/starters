import React from 'react';
import { Button as ShadcnButton, buttonVariants } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import { type LucideIcon, ArrowRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps {
  id: string;
  label?: string | null;
  url?: string | null;
  type?: 'page' | 'post' | 'url' | 'submit' | null;
  page?: { permalink: string | null };
  post?: { slug: string | null };
  size?: VariantProps<typeof buttonVariants>['size'];
  variant?: VariantProps<typeof buttonVariants>['variant'];
  icon?: 'arrow' | 'plus';
  customIcon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  block?: boolean;
}

const Button = ({
  label,
  variant,
  url,
  type,
  page,
  post,
  size = 'default',
  icon,
  customIcon,
  iconPosition = 'left',
  className,
  onClick,
  disabled = false,
  block = false,
}: ButtonProps) => {
  const icons: Record<'arrow' | 'plus', LucideIcon> = {
    arrow: ArrowRight,
    plus: Plus,
  };

  const Icon = customIcon || (icon ? icons[icon] : null);

  const href = (() => {
    if (type === 'page' && page?.permalink) return page.permalink;
    if (type === 'post' && post?.slug) return `/blog/${post.slug}`;
    return url || undefined;
  })();

  const buttonClasses = cn(
    buttonVariants({ variant, size, block }),
    className,
    disabled && 'opacity-50 cursor-not-allowed',
  );

  const content = (
    <span className="flex items-center space-x-2">
      {icon && iconPosition === 'left' && Icon && <Icon className="size-4 shrink-0" />}
      {label && <span>{label}</span>}
      {icon && iconPosition === 'right' && Icon && <Icon className="size-4 shrink-0" />}
    </span>
  );

  if (href) {
    return (
      <ShadcnButton asChild variant={variant} size={size} className={buttonClasses} disabled={disabled}>
        {href.startsWith('/') ? (
          <a href={href}>{content}</a>
        ) : (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {content}
          </a>
        )}
      </ShadcnButton>
    );
  }

  return (
    <ShadcnButton variant={variant} size={size} className={buttonClasses} onClick={onClick} disabled={disabled}>
      {content}
    </ShadcnButton>
  );
};

export default Button;
