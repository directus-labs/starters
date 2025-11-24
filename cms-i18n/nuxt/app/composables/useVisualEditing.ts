import { apply as applyVisualEditing, setAttr } from '@directus/visual-editing';
import type { PrimaryKey } from '@directus/types';

interface ApplyOptions {
	directusUrl: string;
	elements?: HTMLElement[] | HTMLElement;
	onSaved?: (data: { collection?: string; item?: PrimaryKey | null; payload?: Record<string, any> }) => void;
	customClass?: string;
}
export default function useVisualEditing() {
	// Use useState for state that persists across navigation
	const isVisualEditingEnabled = useState('visual-editing-enabled', () => false);
	const route = useRoute();
	const {
		public: { enableVisualEditing, directusUrl },
	} = useRuntimeConfig();

	// Check query param on composable initialization.
	if (route.query['visual-editing'] === 'true' && enableVisualEditing) {
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
