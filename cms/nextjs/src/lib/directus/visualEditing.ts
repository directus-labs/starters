'use client';

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

type PageVisualEditingContext = {
	contentVersion?: string;
	pageId?: string;
};

let pageContext: PageVisualEditingContext = {};

/** Set from PageClient so setBlockAttr() can route through the versioned pages item. */
export function setVisualEditingPageContext(ctx: PageVisualEditingContext) {
	pageContext = ctx;
}

export function getIsDraftPreview(): boolean {
	return !!pageContext.contentVersion;
}

function isVisualEditingActive() {
	if (typeof window === 'undefined') {
		return false;
	}

	const params = new URLSearchParams(window.location.search);

	return (
		params.get('visual-editing') === 'true' ||
		params.get('preview') === 'true' ||
		localStorage.getItem('visual-editing') === 'true'
	);
}

export const setAttr = (options: ApplyOptions) => {
	if (isVisualEditingActive()) {
		return baseSetAttr({ ...options });
	}
};

/** Maps block field names to the M2A path on a versioned `pages` item. */
function toPageBlockFields(
	blockCollection: string,
	fields: string | string[],
	pageFields?: string | string[],
): string | string[] {
	if (pageFields) {
		return pageFields;
	}

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
	const { contentVersion, pageId } = pageContext;

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
