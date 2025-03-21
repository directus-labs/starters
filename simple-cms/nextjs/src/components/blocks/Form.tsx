'use client';

import { FormField } from '@/types/directus-schema';
import Tagline from '@/components/ui/Tagline';
import FormBuilder from '../forms/FormBuilder';
import Headline from '@/components/ui/Headline';
import { setAttr } from '@/lib/directus/visual-editing-utils';

interface FormBlockProps {
	data: {
		id: string;
		tagline: string | null;
		headline: string | null;
		form: {
			id: string;
			on_success?: 'redirect' | 'message' | null;
			sort?: number | null;
			submit_label?: string;
			success_message?: string | null;
			title?: string | null;
			success_redirect_url?: string | null;
			is_active?: boolean | null;
			fields: FormField[];
		};
	};
	itemId?: string;
	blockId?: string;
}

const FormBlock = ({ data, itemId, blockId }: FormBlockProps) => {
	const { tagline, headline, form } = data;

	if (!form) {
		return null;
	}

	return (
		<section className="mx-auto">
			{tagline && (
				<Tagline
					tagline={tagline}
					data-directus={
						itemId
							? setAttr({
									collection: 'block_form',
									item: itemId,
									fields: 'tagline',
									mode: 'popover',
								})
							: undefined
					}
				/>
			)}

			{headline && (
				<Headline
					headline={headline}
					data-directus={
						itemId
							? setAttr({
									collection: 'block_form',
									item: itemId,
									fields: 'headline',
									mode: 'popover',
								})
							: undefined
					}
				/>
			)}

			<FormBuilder form={form} className="mt-8" />
		</section>
	);
};

export default FormBlock;
