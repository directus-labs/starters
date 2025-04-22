import { page } from '$app/state';
import { setAttr as basesetAttr } from '@directus/visual-editing';

interface ApplyOptions {
    collection: string,
    item: string | number,
    fields?: string | string[],
    mode?: 'modal' | 'popover' | 'drawer';
}

export const setAttr = (options: ApplyOptions) => {

    if (page.data.visualEditingEnabled) {
        return basesetAttr({
            ...options,
        });
    }
    return undefined;
};
export default setAttr;