import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@/components/blocks/Button';
import { Form } from '@/components/ui/form';
import Field from './FormField';
import { buildZodSchema } from '@/lib/zodSchemaBuilder';
import type { FormField as FormFieldType } from '@/types/directus-schema';
import { setAttr } from '@/lib/directus/visual-editing-helper';

interface DynamicFormProps {
	fields: FormFieldType[];
	onSubmit: (data: Record<string, any>) => void;
	submitLabel: string;
	itemId?: string;
	formId?: string;
}

const DynamicForm = ({ fields, onSubmit, submitLabel, itemId, formId }: DynamicFormProps) => {
	const sortedFields = [...fields].sort((a, b) => (a.sort || 0) - (b.sort || 0));
	const formSchema = buildZodSchema(fields);

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: fields.reduce<Record<string, any>>((defaults, field) => {
			if (!field.name) return defaults;
			switch (field.type) {
				case 'checkbox':
					defaults[field.name] = false;
					break;
				case 'checkbox_group':
					defaults[field.name] = [];
					break;
				case 'radio':
					defaults[field.name] = '';
					break;
				default:
					defaults[field.name] = '';
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
				data-directus={
					itemId && formId
						? setAttr({
								collection: 'forms',
								item: formId,
								fields: 'fields',
								mode: 'drawer',
							})
						: undefined
				}
			>
				{sortedFields.map((field) => (
					<div
						key={field.id}
						className="w-full"
						data-directus={
							itemId && field.id
								? setAttr({
										collection: 'form_fields',
										item: field.id,
										fields: ['label', 'type', 'required', 'placeholder', 'help_text', 'options'],
										mode: 'drawer',
									})
								: undefined
						}
					>
						<Field key={field.id} field={field} form={form} />
					</div>
				))}
				<div className="w-full">
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
				</div>
			</form>
		</Form>
	);
};

export default DynamicForm;
