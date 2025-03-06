<script setup lang="ts">
import { computed } from 'vue';
import { NuxtLink } from '#components';
import { buttonVariants } from '~/components/ui/button';
import { ArrowRight, Plus } from 'lucide-vue-next';
import { cn } from '@@/shared/utils';
import Button from '../ui/button/Button.vue';

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
	customIcon?: any;
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

const icons: Record<string, any> = {
	arrow: ArrowRight,
	plus: Plus,
};

const Icon = computed(() => props.customIcon || (props.icon ? icons[props.icon] : null));

const href = computed(() => {
	if (props.type === 'page' && props.page?.permalink) return props.page.permalink;
	if (props.type === 'post' && props.post?.slug) return `/blog/${props.post.slug}`;
	return props.url || undefined;
});

const buttonClasses = computed(() =>
	cn(
		buttonVariants({ variant: props.variant as any, size: props.size }),
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
		:variant="variant as any"
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
