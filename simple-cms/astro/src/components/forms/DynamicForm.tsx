import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { setAttr } from '@directus/visual-editing';
import Button from '@/components/blocks/Button';
import { Form } from '@/components/ui/form';
import Field from './FormField';
import { buildZodSchema } from '@/lib/zodSchemaBuilder';
import type { FormField as FormFieldType } from '@/types/directus-schema';

interface DynamicFormProps {
  fields: FormFieldType[];
  onSubmit: (data: Record<string, unknown>) => void;
  submitLabel: string;
  id: string;
}

const DynamicForm = ({ fields, onSubmit, submitLabel, id }: DynamicFormProps) => {
  const sortedFields = [...fields].sort((a, b) => (a.sort || 0) - (b.sort || 0));
  const formSchema = buildZodSchema(fields);
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: fields.reduce<Partial<FormValues>>((defaults, field) => {
      if (!field.name) return defaults;

      const name = field.name as keyof FormValues;

      switch (field.type) {
        case 'checkbox':
          defaults[name] = false as FormValues[typeof name];
          break;
        case 'checkbox_group':
          defaults[name] = [] as FormValues[typeof name];
          break;
        case 'radio':
          defaults[name] = '' as FormValues[typeof name];
          break;
        default:
          defaults[name] = '' as FormValues[typeof name];
          break;
      }

      return defaults;
    }, {}),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-wrap gap-4"
        data-directus={setAttr({
          collection: 'forms',
          item: id,
          fields: 'fields',
          mode: 'popover',
        })}
      >
        {sortedFields.map((field) => (
            <Field key={field.id} field={field} form={form} />
        ))}
        <div className="w-full">
          <div
            data-directus={setAttr({
              collection: 'forms',
              item: id,
              fields: 'submit_label',
              mode: 'popover',
            })}
          >
            <Button type="submit" label={submitLabel} icon="arrow" iconPosition="right" id={`submit-${id || 'form'}`} />
          </div>
        </div>
      </form>
    </Form>
  );
};

export default DynamicForm;
