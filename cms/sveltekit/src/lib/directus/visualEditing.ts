import { browser } from '$app/environment';
import { page } from '$app/state';
import { setAttr as basesetAttr } from '@directus/visual-editing';

interface ApplyOptions {
	collection: string;
	item: string | number;
	fields?: string | string[];
	mode?: 'modal' | 'popover' | 'drawer';
}

export const setAttr = (options: ApplyOptions) => {
	if (browser && sessionStorage.getItem('visual-editing') === 'true') {
		return basesetAttr({
			...options
		});
	}
};

export const enableVisualEditing = () => {
	if (browser && page.data.visualEditingEnabled) {
		sessionStorage.setItem('visual-editing', 'true');
	}
};

export default setAttr;
