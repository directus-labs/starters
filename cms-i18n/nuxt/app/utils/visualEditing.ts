import { setAttr as baseSetAttr } from '@directus/visual-editing';
import { provide } from 'vue';
import type { ComputedRef, InjectionKey, Ref } from 'vue';

interface ApplyOptions {
	collection: string;
	item: string | number;
	fields?: string | string[];
	mode?: 'modal' | 'popover' | 'drawer';
}

export type SetBlockAttrOptions = {
	blockCollection: string;
	blockItemId?: string | number;
	fields: string | string[];
	mode?: 'modal' | 'popover' | 'drawer';
	/**
	 * Draft-only path override on the `pages` item, e.g. `blocks.item:block_pricing.pricing_cards.title`.
	 * Use when the editable field lives deeper than `blocks.item:{block}.{field}`.
	 */
	pageFields?: string | string[];
};

export type VisualEditingPageContext = {
	pageId: Ref<string> | ComputedRef<string>;
	contentVersion: Ref<string | undefined> | ComputedRef<string | undefined>;
};

export const visualEditingPageContextKey: InjectionKey<VisualEditingPageContext> = Symbol('visualEditingPageContext');

/** Set from the page route — provides id/version for setBlockAttr(). */
export function provideVisualEditingPageContext(context: VisualEditingPageContext) {
	provide(visualEditingPageContextKey, context);
}

export const setAttr = (options: ApplyOptions) => {
	return baseSetAttr({ ...options });
};

export function toPageBlockFields(
	blockCollection: string,
	fields: string | string[],
	pageFields?: string | string[],
): string | string[] {
	if (pageFields) return pageFields;

	const list = Array.isArray(fields) ? fields : [fields];
	const paths = list.map((field) => `blocks.item:${blockCollection}.${field}`);
	return paths.length === 1 ? paths[0]! : paths;
}
