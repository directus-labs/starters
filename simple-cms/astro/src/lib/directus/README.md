# Directus Visual Editing Integration

This guide explains how Directus Visual Editing is integrated in our **Astro** application and provides instructions for
developers on how to make new components editable using our custom `useDirectusVisualEditing` hook.

## Overview

Our visual editing setup is designed to support real-time, component-level updates **without full page reloads or
refetches**. This is made possible by:

1. A unified `useDirectusVisualEditing` hook (usable in React `.tsx` components)
2. The `setAttr` utility from `@directus/visual-editing` to declaratively define editable regions
3. A global listener that enables selective component updates when content is edited in Directus

## Configuration

### Environment Variables

Add the following to your `.env`:

```bash
PUBLIC_ENABLE_VISUAL_EDITING=true
PUBLIC_DIRECTUS_URL=https://your-directus-instance.com
```

- Set `PUBLIC_ENABLE_VISUAL_EDITING=false` to fully disable editing features.
- If `PUBLIC_DIRECTUS_URL` is not set or set to `'false'`, initialization will be skipped entirely.

## How It Works

### 1. Initialization via Hook

The `useDirectusVisualEditing` hook handles:

- **Loading** the Directus Visual Editing library
- **Subscribing** the component to visual updates based on `collection:itemId`
- **Applying updates** only when the incoming payload differs from current state

It uses a global event listener to react to edits, and each component manages its own internal state with no refetching
or rerendering unless needed.

### 2. Element Targeting with `setAttr`

Use the `setAttr()` function to define editable fields on HTML elements:

```tsx
import { setAttr } from '@directus/visual-editing';

<div
  data-directus={setAttr({
    collection: 'my_collection',
    item: itemId,
    fields: ['title', 'description'],
    mode: 'popover',
  })}
>
  <h2>{data.title}</h2>
  <p>{data.description}</p>
</div>;
```

## Making Components Editable

You can use the hook directly in any `.tsx` file (no wrapper needed):

```tsx
'use client';
import { useDirectusVisualEditing } from '@/lib/directus/useDirectusVisualEditing';
import { setAttr } from '@directus/visual-editing';

function MyComponent({ data, itemId }) {
  const componentData = useDirectusVisualEditing(data, itemId, 'my_collection');

  return (
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
  );
}
```

### Usage in BaseBlock

To apply editing at the block level using Astro's page builder pattern:

```tsx
import { useDirectusVisualEditing } from '@/lib/directus/useDirectusVisualEditing';
import { setAttr } from '@directus/visual-editing';

function BaseBlock({ block }) {
  const itemId = typeof block.item === 'string' ? block.item : block.item.id;
  const blockData = useDirectusVisualEditing(block.item, itemId, block.collection);

  return (
    <div
      data-directus={setAttr({
        collection: block.collection,
        item: itemId,
        fields: '*',
        mode: 'drawer',
      })}
    >
      <Component data={blockData} id={`block-${block.id}`} />
    </div>
  );
}
```

## Form Field Handling

To allow visual editing of form submit labels without interfering with the button itself:

```tsx
<div
  data-directus={setAttr({
    collection: 'forms',
    item: formId,
    fields: 'submit_label',
    mode: 'popover',
  })}
>
  <Button type="submit" label={submitLabel} icon="arrow" iconPosition="right" disableDirectusEditing={true} />
</div>
```

## Performance

- Only loads visual editing once per session
- One global event listener handles all updates
- Only changed components are updated
- No unnecessary refetches or rerenders

If you don’t need editing (e.g., in production), simply set:

```bash
PUBLIC_ENABLE_VISUAL_EDITING=false
```

## Summary

- Use `useDirectusVisualEditing()` in `.tsx` components
- Use `setAttr()` to define editable fields
- No wrappers needed — everything is self-contained and optimized for Astro + React
- Updates are scoped and efficient, ensuring a responsive editing experience
