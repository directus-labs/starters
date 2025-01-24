<script setup lang="ts">
interface TextProps {
	content: string;
	className?: string;
}

defineProps<TextProps>();
</script>

<template>
	<div :class="['prose dark:prose-invert', className]" v-html="content" />
</template>
