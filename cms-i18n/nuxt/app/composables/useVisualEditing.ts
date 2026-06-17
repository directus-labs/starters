import { apply as applyVisualEditing } from '@directus/visual-editing';
import { setAttr } from '~/utils/visualEditing';
import type { PrimaryKey } from '@directus/types';

interface ApplyOptions {
	directusUrl: string;
	elements?: HTMLElement[] | HTMLElement;
	onSaved?: (data: { collection?: string; item?: PrimaryKey | null; payload?: Record<string, unknown> }) => void;
	customClass?: string;
}
export default function useVisualEditing() {
	// Use useState for state that persists across navigation
	const isVisualEditingEnabled = useState('visual-editing-enabled', () => false);
	const route = useRoute();
	const {
		public: { enableVisualEditing, directusUrl },
	} = useRuntimeConfig();

	// Enable when Directus sends ?visual-editing=true (visual editing tab) or
	// ?preview=true (live preview tab) — both indicate an admin-controlled iframe.
	if ((route.query['visual-editing'] === 'true' || route.query['preview'] === 'true') && enableVisualEditing) {
		isVisualEditingEnabled.value = true;
	} else if (route.query['visual-editing'] === 'false') {
		isVisualEditingEnabled.value = false;
	}

	const apply = (options: Pick<ApplyOptions, 'elements' | 'onSaved' | 'customClass'>) => {
		if (!isVisualEditingEnabled.value) return;
		applyVisualEditing({
			...options,
			directusUrl,
		});
	};

	return {
		isVisualEditingEnabled,
		apply,
		setAttr,
	};
}
