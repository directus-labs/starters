# Simple CMS Starter Templates with i18n Support

Welcome to the **Simple CMS Starter Templates with Internationalization (i18n) Support**! This repository contains
front-end templates for building a multilingual CMS in different frameworks and libraries. Each subfolder represents a
specific framework, offering reusable, scalable, and easy-to-implement CMS solutions with built-in internationalization
support.

## **Templates**

| Framework/Library | Description                                                | Links                               |
| ----------------- | ---------------------------------------------------------- | ----------------------------------- |
| **Next.js**       | A multilingual CMS built using Next.js and its App Router. | [→ Go to Next.js Starter](./nextjs) |
| **Nuxt.js**       | A multilingual CMS template leveraging Nuxt.js features.   | [→ Go to Nuxt.js Starter](./nuxt)   |

## **i18n Features**

All templates in this directory include:

- **Locale-Based Routing**: URLs automatically include locale prefixes (e.g., `/en/about`, `/es/about`) with the default
  locale using clean URLs without a prefix.
- **Directus Translation Integration**: Translations are stored in Directus `{collection}_translations` tables and
  automatically fetched based on the current locale.
- **Automatic Content Merging**: Translations are automatically merged onto base content objects, so components can use
  content directly without checking for translations.
- **Language Switcher**: Built-in language switcher component for easy language selection.
- **SSR & Client Support**: Locale detection works on both server-side and client-side.

## **Directus Setup**

The i18n schema (languages collection, translation tables, etc.) is included in the Directus template located in
`directus/template/`. Apply it to your Directus instance using the
[Directus Template CLI](https://github.com/directus/template-cli):

```bash
npx directus-template-cli@latest apply <path-to-template>
```

## **Folder Structure**

Each subfolder contains:

- **Source Code**: Framework-specific implementation of the CMS with i18n support.
- **Documentation**: Instructions on how to set up, customize, and use the template.

## **Local Setup (with CLI)**

Run this in your terminal:

```bash
npx directus-template-cli@latest init
```
