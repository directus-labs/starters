# Directus Visual Editing Integration

This guide explains how to use Directus Visual Editing in our Astro application.

## Overview

Our approach simplifies Directus Visual Editing integration by:

1. Initializing the Directus Visual Editing library in specific client components
2. Providing a simple utility function to create the data-directus attribute values
3. Supporting selective content updates without full page refreshes when possible

## Configuration

### Environment Variables

You can configure visual editing behavior using environment variables:

```
# Enable or disable visual editing (default is enabled)
PUBLIC_ENABLE_VISUAL_EDITING=true
```

Setting `PUBLIC_ENABLE_VISUAL_EDITING` to `false` will:

- Prevent the event listeners from being initialized
- Make the `setAttr` function return empty strings
- Eliminate any performance overhead from visual editing

## How to Use

### 1. Initialization Options

We initialize the Directus Visual Editing library in components that need editing capabilities using Astro's client
directives:

#### Component-Level Initialization in Astro Pages

In our application, we add the `DirectusVisualEditing` component with the `client:load` directive to make sure it runs
in the browser:

```astro
---
// In an Astro page or component
import DirectusVisualEditing from '@/components/shared/DirectusVisualEditing';
---

<div>
  <!-- Make sure the component runs in the browser with client:load -->
  <DirectusVisualEditing client:load />
  <!-- Rest of your content with data-directus attributes -->
</div>
```

#### In React Components

For React components like BaseBlock.tsx:

```tsx
// In BaseBlock.tsx (for page builder blocks)
import DirectusVisualEditing from '@/components/shared/DirectusVisualEditing';
import { setAttr } from '@/lib/directus/visual-editing-helper';

export default function BaseBlock({ block }) {
  // Component logic

  // Directus needs the item ID as a string or number
  const itemId = typeof block.item === 'string' ? block.item : block.item.id;

  return (
    <>
      <DirectusVisualEditing />
      <div
        data-directus={setAttr({
          collection: block.collection,
          item: itemId,
          fields: '*',
          mode: 'drawer',
        })}
      >
        <Component data={block.item} id={`block-${block.id}`} />
      </div>
    </>
  );
}
```

This approach allows us to:

- Only load visual editing capabilities where needed
- Keep the initialization isolated to specific parts of the application
- Avoid unnecessary script loading in parts of the site that don't need editing

### 2. Making Elements Editable

Use the `setAttr` utility function from `visual-editing-helper.ts` to make elements editable:

```astro
---
import { setAttr } from '@/lib/directus/visual-editing-helper';
---

<div
  class="your-class"
  data-directus={setAttr({
    collection: 'your_collection',
    item: itemId,
    fields: ['title', 'description'], // Can be string or array
    mode: 'popover', // 'drawer' | 'modal' | 'popover'
  })}
>
  Your content here
</div>
```

### 3. Client-Side Loading in Astro

In Astro, to enable the Directus visual editing functionality which needs to run in the browser, we use the
`client:load` directive:

```astro
---
// Your Astro component
import DirectusVisualEditing from '@/components/shared/DirectusVisualEditing';
---

<DirectusVisualEditing client:load />
<div
  data-directus={setAttr({
    collection: 'my_collection',
    item: data.id,
    fields: ['title'],
    mode: 'popover',
  })}
>
  <h1>{data.title}</h1>
  <!-- more content -->
</div>
```

## How It Works

1. The `DirectusVisualEditing` component loads the Directus Visual Editing library and initializes it with support for
   selective content updates within the specific component where it's used.

2. The `setAttr` function provides a simple way to format the data-directus attribute string that Directus needs to
   identify editable elements.

3. When content is edited:
   - For simple text edits, the component attempts to update the content in-place without a page reload
   - For complex changes (e.g., rich text or images), the page will reload to show the updated content

This component-level approach reduces the need for full page refreshes on every edit while keeping our implementation
simple and focused, allowing us to selectively enable editing capabilities only where needed.

## Real-time React Component Updates

For React components that need to respond to changes made in the Directus visual editor without a full page reload, you
can use the `useDirectusVisualEditing` hook:

```tsx
import { useDirectusVisualEditing, setAttr } from '@/lib/directus/visual-editing-helper';
import DirectusVisualEditing from '@/components/shared/DirectusVisualEditing';

function MyComponent({ data, itemId }) {
  // This hook will automatically update the component data when edited in Directus
  const componentData = useDirectusVisualEditing(data, itemId, 'my_collection');

  return (
    <>
      <DirectusVisualEditing />
      <div
        data-directus={setAttr({
          collection: 'my_collection',
          item: itemId,
          fields: ['title', 'content'],
          mode: 'popover',
        })}
      >
        <h2>{componentData.title}</h2>
        <p>{componentData.content}</p>
      </div>
    </>
  );
}
```

The `useDirectusVisualEditing` hook handles:

- Setting up event listeners for Directus visual editing updates
- Updating only the affected component(s) when changes occur
- Cleaning up event listeners when components unmount

This provides a seamless editing experience without requiring full page reloads for simple content changes.

### Handling Form Submit Buttons

When using the Button component for form submissions, you need to wrap it in a div with the form's data-directus
attribute and disable the Button's own Directus editing functionality:

```tsx
<div
  data-directus={
    itemId && formId
      ? setAttr({
          collection: 'forms',
          item: formId,
          fields: 'submit_label',
          mode: 'popover',
        })
      : undefined
  }
>
  <Button
    type="submit"
    label={submitLabel}
    icon="arrow"
    iconPosition="right"
    id={`submit-${formId || 'form'}`}
    disableDirectusEditing={true}
  />
</div>
```

This prevents the Button component from applying its own collection-specific data-directus attribute, which would
conflict with the form's submit label editing.

## Performance Considerations

The `useDirectusVisualEditing` hook is designed to be efficient:

1. It sets up a single global event listener for all components
2. Components register and unregister themselves when mounted/unmounted
3. Updates are applied only to the specific components that need them
4. State updates only occur when there are actual changes to the data

For most applications, this approach has minimal performance impact. However, if you need to disable visual editing
(e.g., in production), you can set `PUBLIC_ENABLE_VISUAL_EDITING=false` in your environment variables.
