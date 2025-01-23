<script setup lang="ts">
import { computed } from 'vue';
import { ArrowRight, Plus } from 'lucide-vue-next';
import Button from '~/components/ui/button/Button.vue';

export interface ButtonProps {
	id: string;
	label?: string | null;
	variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | null;
	url?: string | null;
	type?: 'page' | 'post' | 'url' | 'submit' | null;
	page?: { permalink: string | null };
	post?: { slug: string | null };
	size?: 'default' | 'sm' | 'lg' | 'icon';
	icon?: 'arrow' | 'plus' | null;
	customIcon?: typeof ArrowRight;
	iconPosition?: 'left' | 'right';
	className?: string;
	disabled?: boolean;
	block?: boolean;
}

const props = withDefaults(defineProps<ButtonProps>(), {
	variant: 'default',
	size: 'default',
	iconPosition: 'left',
	disabled: false,
	block: false,
});

// Map predefined icons
const icons = {
	arrow: ArrowRight,
	plus: Plus,
};

const Icon = computed(() => (props.customIcon ? props.customIcon : props.icon ? icons[props.icon] : null));

const href = computed(() => {
	if (props.type === 'page' && props.page?.permalink) return props.page.permalink;
	if (props.type === 'post' && props.post?.slug) return `/blog/${props.post.slug}`;
	return props.url;
});

const buttonClasses = computed(() => [
	props.block && 'w-full',
	props.disabled && 'opacity-50 cursor-not-allowed',
	props.className || '',
]);
</script>

<template>
	<Button v-if="href" :variant="variant" :size="size" :disabled="disabled" :class="buttonClasses" asChild>
		<template #default>
			<component
				:is="href.startsWith('/') ? 'NuxtLink' : 'a'"
				:to="href.startsWith('/') ? href : undefined"
				:href="!href.startsWith('/') ? href : undefined"
				target="_blank"
				rel="noopener noreferrer"
			>
				<span class="flex items-center space-x-2">
					<Icon v-if="icon && iconPosition === 'left'" class="size-4 shrink-0" />
					<span v-if="label">{{ label }}</span>
					<Icon v-if="icon && iconPosition === 'right'" class="size-4 shrink-0" />
				</span>
			</component>
		</template>
	</Button>

	<Button v-else :variant="variant" :size="size" :disabled="disabled" :class="buttonClasses" @click="$emit('click')">
		<span class="flex items-center space-x-2">
			<Icon v-if="icon && iconPosition === 'left'" class="size-4 shrink-0" />
			<span v-if="label">{{ label }}</span>
			<Icon v-if="icon && iconPosition === 'right'" class="size-4 shrink-0" />
		</span>
	</Button>
</template>
