import { useEffect } from 'react';

// This component initializes the Directus visual editing library globally
export default function DirectusVisualEditing() {
  useEffect(() => {
    const loadVisualEditing = async () => {
      try {
        const { apply } = await import('@directus/visual-editing');

        // Initialize Directus visual editing globally
        await apply({
          directusUrl: import.meta.env.PUBLIC_DIRECTUS_URL!,
          onSaved: (updateData) => {
            // Create a custom event to notify components about the update
            const updateEvent = new CustomEvent('directus:update', {
              detail: {
                collection: updateData.collection,
                item: updateData.item,
                payload: updateData.payload,
              },
            });

            // Dispatch the event globally
            window.dispatchEvent(updateEvent);
          },
        });
      } catch (error) {
        console.error('Error initializing Directus Visual Editor:', error);
      }
    };

    loadVisualEditing();
  }, []);

  return null;
}
