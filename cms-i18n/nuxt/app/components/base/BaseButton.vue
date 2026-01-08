<script setup lang="ts">
import { computed } from 'vue';
import { NuxtLink } from '#components';
import { buttonVariants, type ButtonVariants } from '~/components/ui/button';
import { ArrowRight, Plus } from 'lucide-vue-next';
import { cn } from '@@/shared/utils';
import Button from '../ui/button/Button.vue';
import { localizeLink } from '~/lib/i18n/utils';

// Button variant type from the UI component
type ButtonVariant = NonNullable<ButtonVariants['variant']>;
type ButtonSize = NonNullable<ButtonVariants['size']>;

export interface ButtonProps {
	id: string;
	label?: string | null;
	variant?: ButtonVariant | string | null;
	url?: string | null;
	type?: 'page' | 'post' | 'url' | 'submit' | null;
	page?: { permalink: string | null };
	post?: { slug: string | null };
	size?: ButtonSize;
	icon?: 'arrow' | 'plus';
	customIcon?: unknown;
	iconPosition?: 'left' | 'right';
	className?: string;
	disabled?: boolean;
	block?: boolean;
	target?: '_blank' | '_self' | '_parent' | '_top';
}

const props = withDefaults(defineProps<ButtonProps>(), {
	size: 'default',
	iconPosition: 'left',
	disabled: false,
	block: false,
});

// Get locale from composable (handles SSR URL rewrite correctly)
const { currentLocale } = useLocale();
const locale = currentLocale.value;

// Helper to localize internal paths using shared utility
const localize = (path: string | null | undefined) => localizeLink(path, locale) || undefined;

const icons: Record<string, any> = {
	arrow: ArrowRight,
	plus: Plus,
};

const Icon = computed(() => props.customIcon || (props.icon ? icons[props.icon] : null));

const href = computed(() => {
	if (props.type === 'page' && props.page?.permalink) return localize(props.page.permalink);
	if (props.type === 'post' && props.post?.slug) return localize(`/blog/${props.post.slug}`);
	if (props.url) return localize(props.url);
	return undefined;
});

// Safe variant that falls back to 'default' if invalid
const safeVariant = computed<ButtonVariant>(() => {
	const validVariants: ButtonVariant[] = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'];
	return validVariants.includes(props.variant as ButtonVariant) ? (props.variant as ButtonVariant) : 'default';
});

const buttonClasses = computed(() =>
	cn(
		buttonVariants({ variant: safeVariant.value, size: props.size }),
		props.className,
		props.disabled && 'opacity-50 cursor-not-allowed',
		props.block && 'w-full',
	),
);

const linkComponent = computed(() => {
	return href.value ? NuxtLink : 'button';
});
</script>
<template>
	<Button
		:variant="safeVariant"
		:size="size"
		:class="buttonClasses"
		:disabled="disabled"
		:as="linkComponent"
		:href="href"
		:target="target"
		v-bind="$attrs"
	>
		<span class="flex items-center space-x-2">
			<component :is="Icon" v-if="Icon && iconPosition === 'left'" class="size-4 shrink-0" />
			<span v-if="label">{{ label }}</span>
			<slot v-if="$slots.default" />
			<component :is="Icon" v-if="Icon && iconPosition === 'right'" class="size-4 shrink-0" />
		</span>
	</Button>
</template>
