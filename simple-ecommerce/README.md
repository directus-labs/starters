# Simple eCommerce

A simple eCommerce template for Directus. Manage products, orders, and customers.

## Getting Started

### Using Directus Cloud

1. Create a new project at [Directus Cloud](https://directus.io/cloud/) and select the **Simple eCommerce** template.
2. Generate a static token for the admin user.

### Using Docker (Local)

```bash
npx directus-template-cli@latest init
```

Select **Simple eCommerce** from the template list and follow the prompts.

## What's Included

- Products with variants and images
- Categories
- Customers and addresses
- Orders and order items
- Tax rates
- Dashboards

## Licensing

This template targets **Directus 12** and fits the free core tier (9 collections, 2 flows, 2 seats).

| Variant | Folder | License | Public read rules |
|---------|--------|---------|-------------------|
| **Core** (default) | `directus/template/` | Not required | Flat. Public can read all products, categories, and files, including inactive ones and the Private folder. |
| **Licensed** | `directus/template-licensed/` | `LICENSE_KEY` active | Hides inactive products, variants, images, and categories, plus files in the Private folder. |

Core tier rejects custom permission rules, so on core keep anything you don't want public out of these collections, or filter it in your frontend.

To use the licensed variant, set `LICENSE_KEY` in `directus/.env`, recreate Directus (`docker compose up -d --force-recreate directus`), then apply `./template-licensed` instead of `./template`.
