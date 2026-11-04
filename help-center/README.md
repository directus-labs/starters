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
| **Licensed** | `directus/template-licensed/` | `LICENSE_KEY` active | Public reads only published articles (and their translations) and files in the "1. Public" folder and its subfolders. Team users see only profile fields of other users, edit only their own profile and shares, and only see manual flows. |

Core tier rejects custom permission rules and field lists. On core, filter drafts in your frontend and only give the Team role to people you trust with user management. Team can also read every user field on core, including `auth_data`, where SSO stores provider tokens. SSO needs a license, so that's normally empty on core. If the project used SSO while licensed, clear users' `auth_data` before running on core.

To use the licensed variant, set `LICENSE_KEY` in `directus/.env`, recreate Directus (`docker compose up -d --force-recreate directus`), then apply `./template-licensed` instead of `./template`.
