# Directus Visual Editing Integration

This guide explains how Directus Visual Editing is integrated in the application and provides instructions for
developers on how to make new components editable.

## Overview

Directus Visual Editing is configured to support real-time, component-level updates without triggering full page reloads
or unnecessary data refetches. This is achieved through a unified hook called `useDirectusVisualEditing`, which handles
both initialization and update subscriptions.

## Key Features

1. **Single Hook for Initialization and Updates** The `useDirectusVisualEditing` hook loads the Directus Visual Editing
   library once globally and sets up a single event listener. Components register themselves with the hook and receive
   updates individually.

2. **Efficient Component Updates** When content is edited in Directus, only the component with matching
   `collection:itemId` is updated. This avoids full-page refreshes and makes editing fast and responsive.

3. **Dynamic Element Targeting** The `setAttr` function from `@directus/visual-editing` is used to define editable
   fields on any HTML element via the `data-directus` attribute.

## Configuration

### Environment Variables

Configure visual editing via environment variables:

```bash
NEXT_PUBLIC_ENABLE_VISUAL_EDITING=true
NEXT_PUBLIC_DIRECTUS_URL=https://your-directus-instance.com
```

- Set `NEXT_PUBLIC_ENABLE_VISUAL_EDITING=false` to disable visual editing.
- If `NEXT_PUBLIC_DIRECTUS_URL` is not set or is explicitly set to `false`, the system will skip initialization
  entirely.

## How It Works

1. **Initialization** The `useDirectusVisualEditing` hook ensures that the Directus Visual Editing system is initialized
   on first use. The `apply()` function is also re-run on every route change (via Next.js' `usePathname`) to rebind
   visual editing overlays to new elements as pages change — ensuring correct behavior even during client-side
   navigation.

2. **Component Registration** Each component registers a callback using a unique key (`collection:itemId`). When a
   visual edit is saved, a custom `directus:update` event is dispatched globally. Only the component with the matching
   key responds to the update.

3. **Selective Updates** Components only update their local state if the incoming data payload has actually changed.
   This avoids unnecessary re-renders.

## Adding Editable Components

To make a new component editable:

1. Use the `useDirectusVisualEditing` hook inside a client component:

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

2. Use the `setAttr` function from `@directus/visual-editing` to mark editable elements. You can define one or more
   fields and a display mode (`popover`, `modal`, `drawer`).

## Handling Forms

To support editing for form submit labels, wrap the button in a container with the form's `data-directus` attribute, and
disable the button's own directus editing:

```tsx
import { setAttr } from '@directus/visual-editing';

<div
	data-directus={setAttr({
		collection: 'forms',
		item: formId,
		fields: 'submit_label',
		mode: 'popover',
	})}
>
	<Button type="submit" label={submitLabel} icon="arrow" iconPosition="right" disableDirectusEditing={true} />
</div>;
```

## Performance Considerations

- The visual editing library is only loaded once per client session.
- A single global listener handles all updates.
- The `apply()` function is re-applied on every route change to support editing across client-side navigations.
- Only components with changed data update state.
- No full-page reload or global refetch is triggered on save.

This setup ensures an efficient and responsive editing experience that scales across many components without unnecessary
overhead.
