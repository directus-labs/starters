# Directus Visual Editing Integration

This guide explains how to use Directus Visual Editing in our application.

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
NEXT_PUBLIC_ENABLE_VISUAL_EDITING=true
```

Setting `NEXT_PUBLIC_ENABLE_VISUAL_EDITING` to `false` will:

- Prevent the event listeners from being initialized
- Make the `setAttr` function return empty strings
- Eliminate any performance overhead from visual editing

## How to Use

### 1. Initialization Options

We initialize the Directus Visual Editing library at the component level for specific parts of the application that need
editing capabilities:

#### Component-Level Initialization (Current Implementation)

In our application, we've added the `DirectusVisualEditing` component in specific client components that need editing
capabilities:

```tsx
// In BaseBlock.tsx (for page builder blocks)
'use client';

import DirectusVisualEditing from '@/components/shared/DirectusVisualEditing';

const BaseBlock = ({ block }: BaseBlockProps) => {
	// Component logic

	return (
		<div>
			<DirectusVisualEditing />
			<Component data={block.item} blockId={block.id} itemId={itemId} />
		</div>
	);
};
```

```tsx
// In BlogPostClient.tsx (for blog posts)
'use client';

import DirectusVisualEditing from '@/components/shared/DirectusVisualEditing';

export default function BlogPostClient({ post, relatedPosts, ... }) {
	// Component logic

	return (
		<>
			{isDraft && <p>(Draft Mode)</p>}
			<DirectusVisualEditing />
			<Container className="py-12">
				{/* Content */}
			</Container>
		</>
	);
}
```

This approach allows us to:

- Only load visual editing capabilities where needed
- Keep the initialization isolated to specific parts of the application
- Avoid unnecessary script loading in parts of the site that don't need editing

#### Adding to New Components

To add visual editing to new components, import and include the component if it is outside the current BaseBlock
handling or Blog page:

```tsx
// In your client component
import DirectusVisualEditing from '@/components/shared/DirectusVisualEditing';

export default function YourClientComponent() {
	return (
		<>
			<DirectusVisualEditing />
			{/* Your component content with data-directus attributes */}
		</>
	);
}
```

### 2. Making Elements Editable

Use the `setAttr` utility function from `visual-editing-helper.ts` to make elements editable:

```tsx
import { setAttr } from '@/lib/directus/visual-editing-helper';

<div
	className="your-class"
	data-directus={setAttr({
		collection: 'your_collection',
		item: itemId,
		fields: ['title', 'description'], // Can be string or array
		mode: 'popover', // 'drawer' | 'modal' | 'popover'
	})}
>
	Your content here
</div>;
```

### 3. Client Components for Visual Editing

The `setAttr` function works in both client and server components, but Directus visual editing requires client
components to connect to the elements. You have two options:

#### Option A: Server Components with DirectusVisualEditing

```tsx
// Regular server component
import { setAttr } from '@/lib/directus/visual-editing-helper';
import DirectusVisualEditing from '@/components/shared/DirectusVisualEditing';

export default async function MyPage({ params }) {
	const data = await fetchData(params.id);

	return (
		<>
			<DirectusVisualEditing />
			<div
				data-directus={setAttr({
					collection: 'my_collection',
					item: data.id,
					fields: ['title'],
					mode: 'popover',
				})}
			>
				<h1>{data.title}</h1>
				{/* more content */}
			</div>
		</>
	);
}
```

#### Option B: Split into server and client components

```tsx
// Server component (default export)
export default async function MyPage() {
	const data = await fetchData();

	return <MyClientContent data={data} />;
}

// Client component
('use client');
function MyClientContent({ data }) {
	return (
		<div
			data-directus={setAttr({
				collection: 'my_collection',
				item: data.id,
				fields: ['title'],
				mode: 'popover',
			})}
		>
			<h1>{data.title}</h1>
			{/* more content */}
		</div>
	);
}
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

## Real-time Component Updates

For client components that need to respond to changes made in the Directus visual editor without a full page reload, you
can use the `useDirectusVisualEditing` hook:

```tsx
'use client';

import { useDirectusVisualEditing, setAttr } from '@/lib/directus/visual-editing-helper';
import DirectusVisualEditing from '@/components/shared/DirectusVisualEditing';

function MyClientComponent({ data, itemId }) {
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
(e.g., in production), you can set `NEXT_PUBLIC_ENABLE_VISUAL_EDITING=false` in your environment variables.
