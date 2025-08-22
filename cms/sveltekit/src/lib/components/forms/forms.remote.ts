import { form } from '$app/server';
import { useDirectus } from '$lib/directus/directus';
import { createItem, readItem, uploadFiles, withToken } from '@directus/sdk';
import { DIRECTUS_SERVER_TOKEN } from '$env/static/private';
import { error, redirect } from '@sveltejs/kit';
import type { FormField, DirectusFile } from '$lib/types/directus-schema';


interface SubmissionValue {
    field?: FormField | string | null;
    value?: string | null;
    file?: DirectusFile | string | null;
}

export const submitForm = form(async (data) => {

    const formId = data.get("formId")


    const { getDirectus } = useDirectus()
    const directus = getDirectus(fetch)

    const submissionValues: SubmissionValue[] = [];

    if (!formId || typeof formId !== 'string') {
        throw error(400, 'Form ID is required');
    }

    // Add server validation here?
    // Check if form exists

    // Get form and all associated fields
    const directusForm = await directus.request(withToken(DIRECTUS_SERVER_TOKEN, readItem('forms', formId, { fields: ["id", "on_success", "title", "success_message", "success_redirect_url", "is_active", "success_redirect_url", { fields: ["required", "type", "name", "label", "id"] }] })));



    for (const formField of data.entries()) {
        const fieldID = formField[0];
        const value = formField[1];
        if (fieldID === "formId") continue;



        const directusField = directusForm.fields?.find((f: any) => f.id === fieldID)
        if (!directusField) continue; // Field not found in form



        // Should also add field validation here
        if (directusField.type === 'file' && value && value instanceof File && value.size > 0) {
            const blob = new Blob([value], { type: value.type });
            const formData = new FormData();
            formData.append('file', blob, value.name);
            const uploadedFile = await directus.request(withToken(DIRECTUS_SERVER_TOKEN, uploadFiles(formData, { fields: ["id"] }))) as {
                id?: string;
            };
            submissionValues.push({ field: fieldID, file: uploadedFile.id })
        } else {
            submissionValues.push({ field: fieldID, value: value.toString() })
        }



    }
    const payload = {
        form: formId,
        values: submissionValues,
    };
    await directus.request(withToken(DIRECTUS_SERVER_TOKEN, createItem('form_submissions', payload)));

    // Redirect if form has on_success
    // if (directusForm.on_success) {
    //     return redirect(directusForm.on_success)
    // }

    if (directusForm.success_redirect_url) {
        return redirect(303, directusForm.success_redirect_url)
    }


    return {
        success: true,
        message: directusForm.success_message || "Form submitted successfully"
    }


})