import type { FormField } from "$lib/types/directus-schema";

export interface FormBuilderProps {
    class?: string;
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