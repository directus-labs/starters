# CMS Starter Templates with i18n Support

Welcome to the **CMS Starter Templates with Internationalization (i18n) Support**! These templates extend the standard
CMS starters with built-in multilingual support. Each subfolder is a framework-specific implementation with locale-based
routing, Directus translation integration, and a language switcher.

> [!IMPORTANT]
> **This starter requires a Directus license** (Team tier or [Open Innovation Grant](https://directus.io/docs/licensing/overview)). Add your `LICENSE_KEY` before applying the template — see [Directus setup](#directus-setup).

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

## **Directus setup**

From `cms-i18n/directus/`:

1. `cp .env.example .env` — set `LICENSE_KEY`, then start Directus:

   ```bash
   docker compose up -d
   ```

   Or add your key during admin onboarding or in **Settings → License**. If you change `LICENSE_KEY` in `.env` later, run `docker compose up -d --force-recreate directus`.

2. Open `http://localhost:8055`, complete onboarding, and create your admin account.

3. Generate a static token on that admin user (Users Directory → Token → **Save**). Use it for template apply and `DIRECTUS_SERVER_TOKEN` in your frontend `.env`.

4. Apply the template:

   ```bash
   npx directus-template-cli@latest apply
   ```

   - **Template Source:** Local directory  
   - **Template Location:** `./template`  
   - **Directus URL:** `http://localhost:8055`  
   - **Token:** your admin static token  

   Programmatic apply:

   ```bash
   npx directus-template-cli@latest apply -p \
     --directusUrl="http://localhost:8055" \
     --directusToken="YOUR_ADMIN_TOKEN" \
     --templateLocation="./template" \
     --templateType="local"
   ```

5. Connect a frontend ([Next.js](./nextjs) or [Nuxt](./nuxt)): copy its `.env.example`, set the Directus URL, `DIRECTUS_SERVER_TOKEN`, and site URL.

After apply you should see **3 users**: your admin, Frontend Bot, and Content Writer (`writer@example.com`).
