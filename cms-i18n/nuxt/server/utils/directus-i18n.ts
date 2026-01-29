/**
 * Directus i18n Utilities
 *
 * This module provides utilities for fetching and merging translations from Directus.
 * English (en-US) content is stored directly in collections; translations are
 * stored in {collection}_translations tables.
 *
 * Pattern:
 * 1. Fetch content with `translations` field included (when locale !== default)
 * 2. Use `deep` filter to only fetch the requested locale's translations
 * 3. Merge translations onto base objects so components use `item.title` directly
 */
import { DEFAULT_LOCALE, type Locale } from '~/lib/i18n/config';

// Fields to skip when merging translations (metadata and URL fields)
// URL-related fields (slug, permalink) should NOT be translated as they are used for routing
const TRANSLATION_META_FIELDS = [
	'id',
	'languages_code',
	'status',
	'date_created',
	'date_updated',
	'user_created',
	'user_updated',
	'slug', // Posts: URL slug should not be translated
	'permalink', // Pages: URL permalink should not be translated
];

/**
 * Extracts language code from languages_code field.
 * Handles both string codes and Language objects from Directus.
 */
export function getLanguageCode(languagesCode: unknown): string | null {
	if (typeof languagesCode === 'string') return languagesCode;
	if (languagesCode && typeof languagesCode === 'object' && 'code' in languagesCode) {
		return typeof (languagesCode as { code: unknown }).code === 'string'
			? (languagesCode as { code: string }).code
			: null;
	}

	return null;
}

/**
 * Builds deep filter for translations.
 * Fetches both requested locale AND default locale for fallback support.
 */
export function buildTranslationsDeep(locale: Locale) {
	return {
		translations: {
			_filter: {
				_and: [
					{ status: { _eq: 'published' } },
					{
						_or: [{ languages_code: { _eq: locale } }, { languages_code: { _eq: DEFAULT_LOCALE } }],
					},
				],
			},
		},
	};
}

/**
 * Recursively merges translations into base objects.
 *
 * Directus stores default (English) content in main fields and translations
 * in a nested `translations` array. This flattens translated fields to top
 * level so components can use `page.title` instead of `page.translations[0].title`.
 */
export function mergeTranslations<T>(data: T, locale: Locale): T {
	if (!data || typeof data !== 'object') return data;

	const result = { ...data } as Record<string, unknown>;

	// Merge translations array if present
	if (Array.isArray(result.translations)) {
		const translations = result.translations as Array<Record<string, unknown>>;

		// Find translation for requested locale, fallback to default
		const translation =
			translations.find((t) => getLanguageCode(t.languages_code) === locale) ||
			translations.find((t) => getLanguageCode(t.languages_code) === DEFAULT_LOCALE);

		if (translation) {
			for (const [key, value] of Object.entries(translation)) {
				// Skip metadata fields and null values
				if (!TRANSLATION_META_FIELDS.includes(key) && value != null) {
					result[key] = value;
				}
			}
		}

		delete result.translations;
	}

	// Recursively process nested objects and arrays
	for (const key of Object.keys(result)) {
		const value = result[key];

		if (Array.isArray(value)) {
			result[key] = value.map((item) => mergeTranslations(item, locale));
		} else if (value && typeof value === 'object') {
			result[key] = mergeTranslations(value, locale);
		}
	}

	return result as T;
}

/**
 * Helper to build field arrays with optional translations.
 * Uses proper nested field syntax for translations.
 */
export function withTranslations<T extends readonly unknown[]>(
	fields: T,
	includeTranslations: boolean,
): readonly unknown[] {
	return includeTranslations ? [...fields, { translations: ['*'] }] : fields;
}

/**
 * Builds button fields configuration for Directus queries.
 */
export function buildButtonFields(includeTranslations: boolean) {
	const withTrans = includeTranslations ? [{ translations: ['*'] }] : [];

	return ['id', 'label', 'variant', 'url', 'type', { page: ['permalink'] }, { post: ['slug'] }, ...withTrans] as const;
}

/**
 * Builds page fields configuration for Directus queries with i18n support.
 * Note: These fields are passed to the Directus SDK which has strict typing.
 * The SDK requires exact field names matching the schema, but our dynamic
 * field arrays work correctly at runtime.
 */
export function buildPageFields(includeTranslations: boolean) {
	const withTrans = includeTranslations ? [{ translations: ['*'] }] : [];
	const buttonFields = buildButtonFields(includeTranslations);

	const blockRichtextFields = ['id', 'tagline', 'headline', 'content', 'alignment', ...withTrans];

	const blockGalleryFields = ['id', 'tagline', 'headline', ...withTrans, { items: ['id', 'directus_file', 'sort'] }];

	const blockPricingCardsFields = [
		'id',
		'title',
		'description',
		'price',
		'badge',
		'features',
		'is_highlighted',
		...withTrans,
		{ button: buttonFields },
	];

	const blockPricingFields = [
		'id',
		'tagline',
		'headline',
		...withTrans,
		{
			pricing_cards: [...blockPricingCardsFields, 'sort'],
		},
	];

	const blockHeroFields = [
		'id',
		'tagline',
		'headline',
		'description',
		'layout',
		'image',
		...withTrans,
		{
			button_group: [
				'id',
				{
					buttons: buttonFields,
				},
			],
		},
	];

	const blockPostsFields = ['id', 'tagline', 'headline', 'collection', 'limit', ...withTrans];

	const formFieldFields = [
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
		'sort',
		...withTrans,
	];

	const blockFormFields = [
		'id',
		'tagline',
		'headline',
		...withTrans,
		{
			form: [
				'id',
				'title',
				'submit_label',
				'success_message',
				'on_success',
				'success_redirect_url',
				'is_active',
				...withTrans,
				{
					fields: formFieldFields,
				},
			],
		},
	];

	return [
		'title',
		'id',
		...withTrans,
		{
			seo: ['title', 'meta_description', 'og_image', ...withTrans],
			blocks: [
				'id',
				'background',
				'collection',
				'item',
				'sort',
				'hide_block',
				{
					item: {
						block_richtext: blockRichtextFields,
						block_gallery: blockGalleryFields,
						block_pricing: blockPricingFields,
						block_hero: blockHeroFields,
						block_posts: blockPostsFields,
						block_form: blockFormFields,
					},
				},
			],
		},
	];
}

/**
 * Builds post fields configuration for Directus queries with i18n support.
 */
export function buildPostFields(includeTranslations: boolean) {
	const withTrans = includeTranslations ? [{ translations: ['*'] }] : [];

	return [
		'id',
		'title',
		'content',
		'status',
		'published_at',
		'image',
		'description',
		'slug',
		...withTrans,
		{
			seo: ['title', 'meta_description', 'og_image', ...withTrans],
			author: ['id', 'first_name', 'last_name', 'avatar'],
		},
	];
}

/**
 * Builds navigation fields configuration for Directus queries with i18n support.
 */
export function buildNavigationFields(includeTranslations: boolean) {
	const withTrans = includeTranslations ? [{ translations: ['*'] }] : [];

	const navigationItemFields = [
		'id',
		'title',
		'url',
		'type',
		...withTrans,
		{
			page: ['id', 'permalink'],
			post: ['id', 'slug'],
		},
	];

	return [
		'id',
		'title',
		...withTrans,
		{
			items: [
				...navigationItemFields,
				{
					children: navigationItemFields,
				},
			],
		},
	];
}

/**
 * Builds globals fields configuration for Directus queries with i18n support.
 */
export function buildGlobalsFields(includeTranslations: boolean) {
	const withTrans = includeTranslations ? [{ translations: ['*'] }] : [];

	return ['title', 'description', 'logo', 'logo_dark_mode', 'social_links', 'accent_color', 'favicon', ...withTrans];
}
