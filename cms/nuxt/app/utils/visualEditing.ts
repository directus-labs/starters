import { setAttr as baseSetAttr } from '@directus/visual-editing';

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

let pageId = '';
let contentVersion: string | undefined;

/** Set from the page route — provides id/version for setBlockAttr(). */
export function setVisualEditingPageContext(id: string, version?: string) {
	pageId = id;
	contentVersion = version;
}

export function getIsDraftPreview(): boolean {
	return !!contentVersion;
}

/** Page id for attrs — prefers `?id=` from the preview URL when set in context. */
export function getPageIdForEditing(): string {
	return pageId;
}

export const setAttr = (options: ApplyOptions) => {
	return baseSetAttr({ ...options });
};

function toPageBlockFields(
	blockCollection: string,
	fields: string | string[],
	pageFields?: string | string[],
): string | string[] {
	if (pageFields) return pageFields;

	const list = Array.isArray(fields) ? fields : [fields];
	const paths = list.map((field) => `blocks.item:${blockCollection}.${field}`);
	return paths.length === 1 ? paths[0] : paths;
}

/**
 * Visual editing attrs for page-builder blocks.
 *
 * Published/live preview: target the block collection directly for field-level popovers.
 *
 * Content versions (e.g. ?version=draft): route through the versioned `pages`
 * item with nested `blocks.item:…` paths and modal mode.
 */
export const setBlockAttr = (options: SetBlockAttrOptions) => {
	const { blockCollection, blockItemId, fields, mode, pageFields } = options;

	if (contentVersion && pageId) {
		return setAttr({
			collection: 'pages',
			item: pageId,
			fields: toPageBlockFields(blockCollection, fields, pageFields),
			mode: 'modal',
		});
	}

	return setAttr({
		collection: blockCollection,
		item: blockItemId,
		fields,
		mode,
	});
};
