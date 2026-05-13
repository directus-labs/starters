import { z } from 'zod';
import { DEFAULT_LOCALE } from '~/lib/i18n/config';
import { buildTranslationsDeep, mergeTranslations } from '../../utils/directus-i18n';

const querySchema = z.object({
	limit: z.coerce.number().min(1).max(100).default(6),
	page: z.coerce.number().min(1).default(1),
});

export default defineEventHandler(async (event) => {
	const query = await getValidatedQuery(event, querySchema.safeParse);

	if (!query.success) {
		throw createError({ statusCode: 400, message: 'Invalid query parameters' });
	}

	const { limit, page } = query.data;

	// Get locale from event (set by middleware or query param)
	const locale = getLocaleFromEvent(event);
	const includeTranslations = locale !== DEFAULT_LOCALE;

	try {
		const postsPromise = directusServer.request(
			readItems('posts', {
				limit,
				page,
				sort: ['-published_at'],
				fields: includeTranslations
					? ['id', 'title', 'description', 'slug', 'image', 'published_at', { translations: ['*'] }]
					: ['id', 'title', 'description', 'slug', 'image', 'published_at'],
				filter: { status: { _eq: 'published' } },
				...(includeTranslations ? { deep: buildTranslationsDeep(locale) } : {}),
			}),
		);

		const countPromise = directusServer.request(
			readItems('posts', {
				aggregate: { count: '*' },
				filter: { status: { _eq: 'published' } },
			}),
		);

		const [postsRaw, countRaw] = await Promise.all([postsPromise, countPromise]);

		// Merge translations if needed
		const posts = includeTranslations ? postsRaw.map((post) => mergeTranslations(post, locale)) : postsRaw;

		// Get count from aggregate result
		const countResult = countRaw[0];
		const totalCount = countResult && 'count' in countResult ? Number(countResult.count) : 0;

		return {
			posts,
			count: totalCount,
		};
	} catch {
		throw createError({ statusCode: 500, message: 'Failed to fetch paginated posts' });
	}
});
