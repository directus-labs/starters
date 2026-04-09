/** Query keys forwarded to our preview / live-refetch API routes. `token` is never read or sent. */
const PREVIEW_API_PARAM_KEYS = ['preview', 'version', 'id'] as const;

export function searchParamsForPreviewApis(search: string): URLSearchParams {
  const src = new URLSearchParams(search);
  const out = new URLSearchParams();
  for (const key of PREVIEW_API_PARAM_KEYS) {
    const v = src.get(key);
    if (v != null && v !== '') {
      out.set(key, v);
    }
  }

  return out;
}
