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
    // Enabled by default; set to 'false' to disable
    const isEnvEnabled = import.meta.env.PUBLIC_ENABLE_VISUAL_EDITING !== 'false';
    const searchParams = new URLSearchParams(window.location.search);
    const param = searchParams.get('visual-editing');
    // Enable when Directus sends ?preview=true (live preview tab) even without
    // ?visual-editing=true — both indicate an admin-controlled iframe.
    const isPreview = searchParams.get('preview') === 'true';

    if (!isEnvEnabled) {
      if (param === 'true') {
        console.warn('Visual editing is not enabled in this environment.');
      }

      return;
    }

    if (param === 'true') {
      localStorage.setItem('visual-editing', 'true');
    } else if (param === 'false') {
      localStorage.removeItem('visual-editing');
      searchParams.delete('visual-editing');

      const cleanUrl = window.location.pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

      window.history.replaceState({}, '', cleanUrl);
    }

    const persisted = localStorage.getItem('visual-editing') === 'true';
    const shouldEnable = persisted || isPreview;
    setIsVisualEditingEnabled(shouldEnable);

    if (shouldEnable && param !== 'true') {
      searchParams.set('visual-editing', 'true');

      const updatedUrl = window.location.pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

      window.history.replaceState({}, '', updatedUrl);
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
