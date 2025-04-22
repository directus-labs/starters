import type { DirectusFile } from "@/types/directus-schema";

export function getDirectusAssetURL(
  fileOrString: string | DirectusFile | null | undefined
): string {
  if (!fileOrString) return "";
  const baseUrl = import.meta.env.PUBLIC_DIRECTUS_URL;
  if (typeof fileOrString === "string") {
    return `${baseUrl}/assets/${fileOrString}`;
  }
  return `${baseUrl}/assets/${fileOrString.id}`;
}
