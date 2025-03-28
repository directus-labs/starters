import type { FormField } from '@/types/directus-schema';
import Tagline from '../ui/Tagline';
import FormBuilder from '../forms/FormBuilder';
import Headline from '../ui/Headline';
import React from 'react';
import { setAttr } from '@directus/visual-editing';
import { useDirectusVisualEditing } from '@/lib/directus/useDirectusVisualEditing';

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

const FormBlock = ({ data, itemId }: FormBlockProps) => {
  const formData = useDirectusVisualEditing(data, itemId, 'block_form');
  const { tagline, headline, form } = formData;

  if (!form) {
    return null;
  }

  return (
    <section
      className="mx-auto"
      data-directus={
        itemId
          ? setAttr({
              collection: 'block_form',
              item: itemId,
              fields: ['tagline', 'headline', 'form'],
              mode: 'drawer',
            })
          : undefined
      }
    >
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

      <div
        data-directus={
          itemId && form.id
            ? setAttr({
                collection: 'forms',
                item: form.id,
                fields: ['title', 'submit_label', 'success_message', 'success_redirect_url', 'on_success'],
                mode: 'drawer',
              })
            : undefined
        }
      >
        <FormBuilder form={form} className="mt-8" itemId={itemId} />
      </div>
    </section>
  );
};

export default FormBlock;
