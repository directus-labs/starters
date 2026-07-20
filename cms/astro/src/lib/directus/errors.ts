/** Extracts an HTTP status from a Directus SDK RequestError without depending on an internal SDK export. */
export function getDirectusErrorStatus(error: unknown): number | null {
  if (typeof error !== 'object' || error === null || !('response' in error)) return null;
  const { response } = error;
  if (typeof response !== 'object' || response === null || !('status' in response)) return null;

  return typeof response.status === 'number' ? response.status : null;
}
