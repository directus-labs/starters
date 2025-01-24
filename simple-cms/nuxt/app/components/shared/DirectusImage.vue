<script setup lang="ts">
import { getDirectusAssetURL } from '@@/server/utils/directus-utils';

interface DirectusImageProps {
	uuid: string;
	alt: string;
	width?: number;
	height?: number;
	[key: string]: any;
}

const props = withDefaults(defineProps<DirectusImageProps>(), {
	width: undefined,
	height: undefined,
});

const { uuid, alt, width, height, ...rest } = props;

const src = computed(() => getDirectusAssetURL(uuid));
</script>

<template>
	<img :src="src" :alt="alt" :width="width" :height="height" v-bind="rest" />
</template>
