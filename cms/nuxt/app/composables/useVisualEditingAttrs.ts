import { computed, inject } from 'vue';
import {
	setAttr,
	toPageBlockFields,
	type SetBlockAttrOptions,
	visualEditingPageContextKey,
} from '~/utils/visualEditing';

export default function useVisualEditingAttrs() {
	const pageContext = inject(visualEditingPageContextKey);
	const pageId = computed(() => pageContext?.pageId.value || '');
	const isDraftPreview = computed(() => !!pageContext?.contentVersion.value);

	const setBlockAttr = (options: SetBlockAttrOptions) => {
		const { blockCollection, blockItemId, fields, mode, pageFields } = options;

		if (pageContext?.contentVersion.value && pageContext.pageId.value) {
			return setAttr({
				collection: 'pages',
				item: pageContext.pageId.value,
				fields: toPageBlockFields(blockCollection, fields, pageFields),
				mode: 'modal',
			});
		}

		if (!blockItemId) return undefined;

		return setAttr({
			collection: blockCollection,
			item: blockItemId,
			fields,
			mode,
		});
	};

	return {
		isDraftPreview,
		pageId,
		setBlockAttr,
	};
}
