'use client';

import { useState, useEffect } from 'react';
import { apply as applyVisualEditing, setAttr } from '@directus/visual-editing';

interface ApplyOptions {
  elements?: HTMLElement[] | HTMLElement;
  onSaved?: () => void;
  mode?: 'modal' | 'popover' | 'drawer';
}

export function useVisualEditing() {
  const [isVisualEditingEnabled, setIsVisualEditingEnabled] = useState(false);

  useEffect(() => {
    const enableVisualEditing = import.meta.env.PUBLIC_ENABLE_VISUAL_EDITING === 'true';
    const searchParams = new URLSearchParams(window.location.search);
    const visualEditingParam = searchParams.get('visual-editing');

    if (visualEditingParam === 'true' && enableVisualEditing) {
      setIsVisualEditingEnabled(true);
    } else if (visualEditingParam === 'false') {
      setIsVisualEditingEnabled(false);
    }
  }, []);

  const apply = (options: Pick<ApplyOptions, 'elements' | 'onSaved' | 'mode'>) => {
    if (!isVisualEditingEnabled) return;

    applyVisualEditing({
      ...options,
      directusUrl: import.meta.env.PUBLIC_DIRECTUS_URL || '',
    });
  };

  return {
    isVisualEditingEnabled,
    apply,
    setAttr,
  };
}
