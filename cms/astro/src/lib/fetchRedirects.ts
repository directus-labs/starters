/* eslint-disable no-console */
import type { Schema, Redirect } from '@/types/directus-schema';
import { createDirectus, readItems, rest } from '@directus/sdk';

export interface AstroRedirect {
  source: string;
  destination: string;
  permanent: boolean;
}


type RawRedirect = Pick<Redirect, 'url_from' | 'url_to' | 'response_code'>;
type ValidRawRedirect = {
  url_from: string;
  url_to: string;
  response_code: '301' | '302';
};

export async function fetchRedirects(
  directusUrl: string
): Promise<AstroRedirect[]> {
  if (!directusUrl) {
    console.error('Missing DIRECTUS_URL');
    return [];
  }

  const directus = createDirectus<Schema>(directusUrl).with(rest());
  let items: RawRedirect[] = [];

  try {
    items = await directus.request(
      readItems('redirects', {
        fields: ['url_from', 'url_to', 'response_code'],
      })
    );
  } catch (err) {
    console.error('Error fetching redirects:', err);
    return [];
  }

  const valids = items.filter(
    (r): r is ValidRawRedirect =>
      typeof r.url_from === 'string' &&
      typeof r.url_to === 'string' &&
      (r.response_code === '301' || r.response_code === '302')
  );

  return valids.map((r) => ({
    source: r.url_from,
    destination: r.url_to,
    permanent: r.response_code === '301',
  }));
}
