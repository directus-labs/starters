import { browser } from '$app/environment';
import { page } from '$app/state';
import { setAttr as basesetAttr } from '@directus/visual-editing';
import { PersistedState } from "runed";

interface ApplyOptions {
	collection: string;
	item: string | number;
	fields?: string | string[];
	mode?: 'modal' | 'popover' | 'drawer';
}

export const visualEditingEnabled = new PersistedState('visual-editing', false, {
	storage: 'session',
});

export const setAttr = (options: ApplyOptions) => {
	if (browser && visualEditingEnabled.current === true) {
		return basesetAttr({
			...options
		});
	}
};



export const enableVisualEditing = () => {
	if (browser && page.data.visualEditingEnabled) {
		visualEditingEnabled.current = true
	}
};

export default setAttr;
