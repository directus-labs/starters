'use client';

import { Button as ShadcnButton, buttonVariants } from '@/components/ui/button';
import { LucideIcon, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getLocaleFromPath, addLocaleToPath } from '@/lib/i18n/utils';

export interface ButtonProps {
	id: string;
	label?: string | null;
	variant?: string | null;
	url?: string | null;
	type?: 'page' | 'post' | 'url' | 'submit' | null;
	page?: { permalink: string | null };
	post?: { slug: string | null };
	size?: 'default' | 'sm' | 'lg' | 'icon';
	icon?: 'arrow' | 'plus';
	customIcon?: LucideIcon;
	iconPosition?: 'left' | 'right';
	className?: string;
	onClick?: () => void;
	disabled?: boolean;
	block?: boolean;
}

const Button = ({
	id,
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
	const pathname = usePathname();
	const { locale } = getLocaleFromPath(pathname);
	const icons: Record<string, LucideIcon> = {
		arrow: ArrowRight,
		plus: Plus,
	};

	const Icon = customIcon || (icon ? icons[icon] : null);

	const href = (() => {
		if (type === 'page' && page?.permalink) {
			return addLocaleToPath(page.permalink, locale);
		}
		if (type === 'post' && post?.slug) {
			return addLocaleToPath(`/blog/${post.slug}`, locale);
		}

		return url || undefined;
	})();

	const buttonClasses = cn(
		buttonVariants({ variant: variant as any, size }),
		className,
		disabled && 'opacity-50 cursor-not-allowed',
		block && 'w-full',
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
			<ShadcnButton asChild variant={variant as any} size={size} className={buttonClasses} disabled={disabled}>
				{href.startsWith('/') ? (
					<Link href={href}>{content}</Link>
				) : (
					<a href={href} target="_blank" rel="noopener noreferrer">
						{content}
					</a>
				)}
			</ShadcnButton>
		);
	}

	return (
		<ShadcnButton variant={variant as any} size={size} className={buttonClasses} onClick={onClick} disabled={disabled}>
			{content}
		</ShadcnButton>
	);
};

export default Button;
