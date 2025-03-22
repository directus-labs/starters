'use client';

import RichText from '@/components/blocks/RichText';
import Hero from '@/components/blocks/Hero';
import Gallery from '@/components/blocks/Gallery';
import Pricing from '@/components/blocks/Pricing';
import Posts from '@/components/blocks/Posts';
import Form from '@/components/blocks/Form';
import { setAttr } from '@/lib/directus/visual-editing-helper';
import DirectusVisualEditing from '@/components/shared/DirectusVisualEditing';

interface BaseBlockProps {
	block: {
		collection: string;
		item: any;
		id: string;
	};
}

const BaseBlock = ({ block }: BaseBlockProps) => {
	const components: Record<string, React.ElementType> = {
		block_hero: Hero,
		block_richtext: RichText,
		block_gallery: Gallery,
		block_pricing: Pricing,
		block_posts: Posts,
		block_form: Form,
	};

	const Component = components[block.collection];

	if (!Component) {
		return null;
	}

	const itemId = block.item?.id;

	return (
		<div
			className="relative"
			data-directus={setAttr({
				collection: 'page_blocks',
				item: block.id,
				fields: ['item', 'collection', 'background', 'hide_block'],
				mode: 'modal',
			})}
		>
			<DirectusVisualEditing />
			<Component data={block.item} blockId={block.id} itemId={itemId} />
		</div>
	);
};

export default BaseBlock;
