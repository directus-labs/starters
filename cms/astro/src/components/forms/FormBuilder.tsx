import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import DynamicForm from './DynamicForm';
import type { FormField } from '@/types/directus-schema';
import { cn } from '@/lib/utils';

interface FormBuilderProps {
  className?: string;
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
}

const FormBuilder = ({ form, className }: FormBuilderProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!form.is_active) return null;

  const handleSubmit = async (data: Record<string, unknown>) => {
    setError(null);

    try {
      const formData = new FormData();
      formData.append('_formId', form.id);

      for (const field of form.fields) {
        if (!field.name) continue;
        const value = data[field.name];
        if (value === undefined || value === null) continue;

        if (value instanceof File) {
          formData.append(field.name, value);
        } else if (Array.isArray(value)) {
          formData.append(field.name, JSON.stringify(value));
        } else {
          formData.append(field.name, String(value));
        }
      }

      const response = await fetch('/api/forms/submit', { method: 'POST', body: formData });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(typeof body.error === 'string' ? body.error : 'Form submission failed');
      }

      if (form.on_success === 'redirect' && form.success_redirect_url) {
        window.location.href = form.success_redirect_url;
      } else {
        setIsSubmitted(true);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit the form. Please try again later.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center">
        <CheckCircle className="size-12 text-green-500" />
        <p className="text-gray-600">{form.success_message || 'Your form has been submitted successfully.'}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6 border border-input p-8 rounded-lg', className)}>
      {form.title && <h3 className="text-xl font-semibold mb-4">{form.title}</h3>}

      {error && (
        <div className="p-4 text-red-500 bg-red-100 rounded-md">
          <strong>Error:</strong> {error}
        </div>
      )}

      <DynamicForm
        fields={form.fields}
        onSubmit={handleSubmit}
        submitLabel={form.submit_label || 'Submit'}
        id={form.id}
      />
    </div>
  );
};

export default FormBuilder;
