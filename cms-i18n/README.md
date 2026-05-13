# CMS Starter Templates with i18n Support

Welcome to the **CMS Starter Templates with Internationalization (i18n) Support**! These templates extend the standard
CMS starters with built-in multilingual support. Each subfolder is a framework-specific implementation with locale-based
routing, Directus translation integration, and a language switcher.

## **Templates**

| Framework   | Description                                    | Links                               |
| ----------- | ---------------------------------------------- | ----------------------------------- |
| **Next.js** | Multilingual CMS built with Next.js App Router | [→ Go to Next.js Starter](./nextjs) |
| **Nuxt**    | Multilingual CMS template using Nuxt 4         | [→ Go to Nuxt Starter](./nuxt)      |

## **i18n Features**

All templates in this directory include:

- **Locale-Based Routing**: URLs automatically include locale prefixes (e.g., `/en/about`, `/es/about`) with the default
  locale using clean URLs without a prefix
- **Directus Translation Integration**: Translations are stored in Directus `{collection}_translations` tables and
  automatically fetched based on the current locale
- **Automatic Content Merging**: Translations are merged onto base content objects so components use `item.title`
  directly without checking for translations
- **Language Switcher**: Built-in component for easy language selection
- **SSR & Client Support**: Locale detection works on both server-side (via middleware) and client-side (via route
  detection)

## **Everything from the CMS Templates**

These templates also include all CMS starter features:

- Dynamic page builder with reusable blocks
- Blog with listing and detail pages
- Dynamic forms with Directus submission storage
- Live preview and visual editing
- Draft content support
- SEO metadata management

## **Directus Setup**

The i18n schema (languages collection, translation tables, etc.) is included in the Directus template located in
`directus/template/`. Apply it to your Directus instance using the
[Directus Template CLI](https://github.com/directus/template-cli):

```bash
npx directus-template-cli@latest apply <path-to-template>
```

## **Local Setup (with CLI)**

Run this in your terminal:

```bash
npx directus-template-cli@latest init
```
