import { useDirectus } from "../lib/directus";

export async function POST({ request }) {
  const { formId, fields, data } = await request.json();
  const { directus, uploadFiles, createItem, withToken } = useDirectus();
  const TOKEN = import.meta.env.DIRECTUS_FORM_TOKEN;

  if (!TOKEN) {
    return new Response(
      JSON.stringify({ error: "Directus token is missing" }),
      { status: 500 }
    );
  }

  try {
    const submissionValues = [];

    for (const field of fields) {
      const value = data[field.name];

      if (field.type === "file" && value instanceof File) {
        const formData = new FormData();
        formData.append("file", value);

        const uploadedFile = await directus.request(
          withToken(TOKEN, uploadFiles(formData))
        );
        if (uploadedFile?.id) {
          submissionValues.push({ field: field.id, file: uploadedFile.id });
        }
      } else {
        submissionValues.push({ field: field.id, value: value.toString() });
      }
    }

    await directus.request(
      withToken(
        TOKEN,
        createItem("form_submissions", {
          form: formId,
          values: submissionValues,
        })
      )
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to submit form" }), {
      status: 500,
    });
  }
}
