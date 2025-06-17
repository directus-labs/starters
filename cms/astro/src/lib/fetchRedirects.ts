/* eslint-disable no-console */
import type { Schema } from '@/types/directus-schema';
import { createDirectus, readItems, rest } from '@directus/sdk';

export interface AstroRedirect {
  source: string;
  destination: string;
  permanent: boolean;
}

export async function fetchRedirects(directusUrl: string): Promise<AstroRedirect[]> {
  if (!directusUrl) {
    console.warn('Missing DIRECTUS_URL');
    return [];
  }

  try {
    const directus = createDirectus<Schema>(directusUrl).with(rest());

    const redirects = await directus.request(
      readItems('redirects', {
        filter: {
          url_from: { _nnull: true },
          url_to: { _nnull: true },
        },
        // Get all redirects (Directus defaults to 100 for limit)
        limit: -1,
      }),
    );

    const processedRedirects: AstroRedirect[] = [];

    for (const redirect of redirects) {
      if (!redirect.url_from || !redirect.url_to) {
        continue;
      }

      // If response code is not set, default to 301
      let responseCode = redirect.response_code ? parseInt(redirect.response_code) : 301;

      if (responseCode !== 301 && responseCode !== 302) {
        responseCode = 301;
      }

      processedRedirects.push({
        source: redirect.url_from,
        destination: redirect.url_to,
        permanent: responseCode === 301,
      });
    }

    console.info(`${redirects.length} redirects loaded`);

    for (const redirect of redirects) {
      console.info(`${redirect.response_code} - From: ${redirect.url_from} To:${redirect.url_to}`);
    }

    return processedRedirects;
  } catch (error) {
    console.error('Error loading redirects', error);
    return [];
  }
}
