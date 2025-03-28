'use client';

import { useState, useEffect } from 'react';

let globalListenerInitialized = false;
const componentCallbacks = new Map<string, (updateData: any) => void>();

const isVisualEditingEnabled = import.meta.env.PUBLIC_ENABLE_VISUAL_EDITING !== 'false';
const directusUrl = import.meta.env.PUBLIC_DIRECTUS_URL;

export function useDirectusVisualEditing<T>(data: T, itemId: string | undefined, collection: string) {
  const [componentData, setComponentData] = useState<T>(data);

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  useEffect(() => {
    setComponentData(data);
  }, [data]);

  useEffect(() => {
    if (!isVisualEditingEnabled || !itemId || !directusUrl || directusUrl === 'false') return;

    const componentKey = `${collection}:${itemId}`;

    componentCallbacks.set(componentKey, (updateData: any) => {
      setComponentData((prev: T) => {
        const hasChanges = Object.keys(updateData.payload).some(
          (key) => (prev as any)[key] !== updateData.payload[key],
        );

        return hasChanges ? { ...prev, ...updateData.payload } : prev;
      });
    });

    if (!globalListenerInitialized) {
      globalListenerInitialized = true;

      window.addEventListener('directus:update', ((event: CustomEvent) => {
        const { collection, item, payload } = event.detail;
        const key = `${collection}:${item}`;
        const callback = componentCallbacks.get(key);

        if (callback) {
          callback({ collection, item, payload });
        }
      }) as EventListener);
    }

    const reapplyVisualEditing = async () => {
      try {
        const { apply } = await import('@directus/visual-editing');

        await apply({
          directusUrl,
          onSaved: (updateData) => {
            const updateEvent = new CustomEvent('directus:update', {
              detail: updateData,
            });

            window.dispatchEvent(updateEvent);
          },
        });
      } catch (error) {
        console.error('Error re-applying Directus Visual Editing:', error);
      }
    };

    reapplyVisualEditing();

    return () => {
      componentCallbacks.delete(componentKey);
    };
  }, [pathname, itemId, collection]);

  return componentData;
}
