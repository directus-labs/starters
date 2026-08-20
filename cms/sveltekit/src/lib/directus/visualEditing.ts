import { browser } from '$app/environment';
import { page } from '$app/state';
import { setAttr as basesetAttr } from '@directus/visual-editing';

interface ApplyOptions {
	collection: string;
	item: string | number;
	fields?: string | string[];
	mode?: 'modal' | 'popover' | 'drawer';
}

export type SetBlockAttrOptions = {
	blockCollection: string;
	blockItemId: string | number;
	fields: string | string[];
	mode?: 'modal' | 'popover' | 'drawer';
	/**
	 * Draft-only path override on the `pages` item, e.g. `blocks.item:block_pricing.pricing_cards.title`.
	 * Use when the editable field lives deeper than `blocks.item:{block}.{field}`.
	 */
	pageFields?: string | string[];
};

function isVisualEditingActive() {
	if (page.data.visualEditingEnabled) return true;
	return browser && sessionStorage.getItem('visual-editing') === 'true';
}

export const setAttr = (options: ApplyOptions) => {
	if (isVisualEditingActive()) {
		return basesetAttr({ ...options });
	}
};

/** Maps block field names to the M2A path on a versioned `pages` item. */
function toPageBlockFields(
	blockCollection: string,
	fields: string | string[],
	pageFields?: string | string[]
): string | string[] {
	if (pageFields) return pageFields;

	const list = Array.isArray(fields) ? fields : [fields];
	const paths = list.map((field) => `blocks.item:${blockCollection}.${field}`);
	return paths.length === 1 ? paths[0] : paths;
}

/**
 * Visual editing attrs for page-builder blocks.
 *
 * Page blocks are M2A items (`page_blocks` → `block_hero`, etc.). On published/live
 * preview, target the block collection directly for field-level popovers.
 *
 * When a content version is active (e.g. `?version=draft`), edits belong to the
 * versioned `pages` item — so attrs route through that parent with nested
 * `blocks.item:…` paths and open in modal mode.
 */
export const setBlockAttr = (options: SetBlockAttrOptions) => {
	const { blockCollection, blockItemId, fields, mode, pageFields } = options;
	const contentVersion = page.data.contentVersion as string | undefined;
	const pageId = page.data.id as string | undefined;

	if (contentVersion && pageId) {
		return setAttr({
			collection: 'pages',
			item: pageId,
			fields: toPageBlockFields(blockCollection, fields, pageFields),
			mode: 'modal'
		});
	}

	return setAttr({
		collection: blockCollection,
		item: blockItemId,
		fields,
		mode
	});
};

export const enableVisualEditing = () => {
	if (browser && page.data.visualEditingEnabled) {
		sessionStorage.setItem('visual-editing', 'true');
	}
};

export default setAttr;
