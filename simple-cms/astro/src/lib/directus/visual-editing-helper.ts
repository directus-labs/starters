import { useState, useEffect } from 'react';

// Reference to track if we've already set up the global event listener
let globalListenerInitialized = false;
// Store for component update callbacks
const componentCallbacks = new Map<string, (updateData: any) => void>();

// Check if visual editing is enabled via environment variable
// Default to true if not specified
const isVisualEditingEnabled = import.meta.env.PUBLIC_ENABLE_VISUAL_EDITING !== 'false';

/**
 * A hook that handles Directus visual editing updates for a component
 *
 * This hook enables real-time updates to component data when changes are made in the Directus visual editor.
 * It maintains a global event listener for Directus update events and updates only the affected components.
 *
 * @param data The initial data for the component
 * @param itemId The ID of the item in Directus
 * @param collection The collection name in Directus
 * @returns The current component data, which updates automatically when edited in Directus
 */
export function useDirectusVisualEditing<T>(data: T, itemId: string | undefined, collection: string) {
  const [componentData, setComponentData] = useState<T>(data);

  // Initialize with the latest data from props when it changes
  useEffect(() => {
    setComponentData(data);
  }, [data]);

  // Register this component to receive updates - only if visual editing is enabled
  useEffect(() => {
    if (!isVisualEditingEnabled || !itemId) return;

    // Create a unique key for this component instance
    const componentKey = `${collection}:${itemId}`;

    // Register this component's update callback
    componentCallbacks.set(componentKey, (updateData: any) => {
      // Use a reference to current data to avoid unnecessary renders
      setComponentData((prev: T) => {
        // Check if there are actual changes to apply
        const hasChanges = Object.keys(updateData.payload).some(
          (key) => (prev as any)[key] !== updateData.payload[key],
        );

        // Only update state if there are changes
        if (hasChanges) {
          return { ...prev, ...updateData.payload };
        }

        return prev;
      });
    });

    // Set up the global event listener once
    if (!globalListenerInitialized) {
      globalListenerInitialized = true;

      // Listen for the custom event that the DirectusVisualEditing component will dispatch
      window.addEventListener('directus:update', ((event: CustomEvent) => {
        const { collection, item, payload } = event.detail;
        const key = `${collection}:${item}`;

        // Find and call the appropriate component callback
        const callback = componentCallbacks.get(key);

        if (callback) {
          callback({ collection, item, payload });
        }
      }) as EventListener);
    }

    return () => {
      // Clean up when component unmounts
      componentCallbacks.delete(componentKey);
    };
  }, [itemId, collection]);

  return componentData;
}

/**
 * Server-safe implementation of the Directus setAttr function.
 *
 * This function formats the Directus edit configuration into the attribute string format
 * needed for the data-directus attribute. It works on both client and server.
 * If visual editing is disabled via environment variable, it returns an empty string.
 */
export function setAttr(config: {
  collection: string;
  item: string | number;
  fields: string | string[];
  mode?: 'drawer' | 'modal' | 'popover';
}): string {
  // Return empty string if visual editing is disabled
  if (!isVisualEditingEnabled) {
    return '';
  }

  const { collection, item, fields, mode } = config;
  const parts: string[] = [];

  if (collection) parts.push(`collection:${collection}`);
  if (item) parts.push(`item:${item}`);

  if (fields) {
    const fieldsStr = Array.isArray(fields) ? fields.join(',') : fields;
    parts.push(`fields:${fieldsStr}`);
  }

  if (mode) parts.push(`mode:${mode}`);

  return parts.join(';');
}
