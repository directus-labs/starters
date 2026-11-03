# Help Center

A multilingual help center template for Directus with articles and collections.

## Getting Started

### Using Directus Cloud

1. Create a new project at [Directus Cloud](https://directus.io/cloud/) and select the **Help Center** template.
2. Generate a static token for the admin user.

### Using Docker (Local)

```bash
npx directus-template-cli@latest init
```

Select **Help Center** from the template list and follow the prompts.

## What's Included

- Help articles with translations
- Help collections for organizing articles
- Article feedback tracking
- Multi-language support
- Dashboards

## Licensing

This template targets **Directus 12** and fits the free core tier (8 collections, 0 flows, 2 seats).

| Variant | Folder | License | Permission rules |
|---------|--------|---------|------------------|
| **Core** (default) | `directus/template/` | Not required | Flat. Public can read all articles (including drafts) and all files. Team users can edit any user and any share. |
| **Licensed** | `directus/template-licensed/` | `LICENSE_KEY` active | Public reads only published articles and files in the Public and Uploads folders. Team users edit only their own profile and shares, and only see manual flows. |

Core tier rejects custom permission rules. On core, filter drafts in your frontend and only give the Team role to people you trust with user management.

To use the licensed variant, set `LICENSE_KEY` in `directus/.env`, recreate Directus (`docker compose up -d --force-recreate directus`), then apply `./template-licensed` instead of `./template`.
