import { Checkbox } from '@/components/ui/checkbox';

import type { UseFormReturn } from 'react-hook-form';

interface CheckboxFieldProps {
  name: string;
  label: string;
  form: UseFormReturn<Record<string, boolean>>;
}

const CheckboxField = ({ name, label, form }: CheckboxFieldProps) => (
  <div className="flex items-center gap-x-2">
    <Checkbox id={name} checked={form.watch(name)} onCheckedChange={(checked) => form.setValue(name, !!checked)} />
    <label htmlFor={name} className="text-sm">
      {label}
    </label>
  </div>
);

export default CheckboxField;
