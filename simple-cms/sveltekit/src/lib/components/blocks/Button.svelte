<script lang="ts">
	import { Button as ShadcnButton, buttonVariants } from '../ui/button';

	import { Icon as Icontype, ArrowRight, Plus } from 'lucide-svelte';
	import { cn } from '../../utils';

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
		customIcon?: typeof Icontype;
		iconPosition?: 'left' | 'right';
		class?: string;
		onClick?: () => void;
		disabled?: boolean;
		block?: boolean;
	}

	const {
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
		class: className,
		onClick,
		disabled = false,
		block = false
	}: ButtonProps = $props();

	const icons: Record<string, typeof Icontype> = {
		arrow: ArrowRight,
		plus: Plus
	};

	const Icon = $state(customIcon || (icon ? icons[icon] : null));

	const href = $derived.by(() => {
		if (type === 'page' && page?.permalink) return page.permalink;
		if (type === 'post' && post?.slug) return `/blog/${post.slug}`;
		return url || undefined;
	});

	const buttonClasses = $derived.by(() =>
		cn(
			buttonVariants({ variant: variant as any, size }),
			className,
			disabled && 'opacity-50 cursor-not-allowed',
			block && 'w-full'
		)
	);
</script>

{#snippet content()}
	<span class="flex items-center space-x-2">
		{#if icon && iconPosition === 'left' && Icon}
			<Icon class="size-4 shrink-0" />
		{/if}

		{#if label}
			<span>{label}</span>
		{/if}

		{#if icon && iconPosition === 'right' && Icon}
			<Icon class="size-4 shrink-0" />
		{/if}
	</span>
{/snippet}

{#if href}
	<!-- TODO CHECK IF ASCHILD WORKS -->
	<ShadcnButton variant={variant as any} {size} class={buttonClasses} {disabled} onclick={onClick}>
		{#if href.startsWith('/')}
			<a {href}>{@render content()}</a>
		{:else}
			<a {href} target="_blank" rel="noopener noreferrer">
				{@render content()}
			</a>
		{/if}
	</ShadcnButton>
{:else}
	<ShadcnButton type="submit" variant={variant as any} {size} class={buttonClasses} {disabled}>
		{@render content()}
	</ShadcnButton>
{/if}
