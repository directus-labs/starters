import { DIRECTUS_SERVER_TOKEN } from "$env/static/private";
import { readItem, withToken, type QueryFields } from "@directus/sdk";
import { useDirectus } from "./directus";
import type { Form, Schema } from "$lib/types/directus-schema";

const formDetails: QueryFields<Schema, Form> = [
    'id',
    'title',
    'submit_label',
    'success_message',
    'on_success',
    'success_redirect_url',
    'is_active',
    {
        fields: [
            'id',
            'name',
            'type',
            'label',
            'placeholder',
            'help',
            'validation',
            'width',
            'choices',
            'required',
            'sort'
        ]
    }]


export const fetchFormFields = async (formId: string, customFetch?: typeof fetch) => {
    const { getDirectus } = useDirectus();
    const directus = getDirectus(customFetch ?? fetch);
    const form = await directus.request(withToken(DIRECTUS_SERVER_TOKEN, readItem('forms', formId, { fields: formDetails })));
    return form;
}