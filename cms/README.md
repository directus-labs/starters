# CMS Starter Templates

Welcome to the **CMS Starter Templates**! This collection contains front-end templates for building a full-featured CMS
integrated with Directus. Each subfolder is a specific framework implementation with pages, blog posts, dynamic forms,
live preview, and visual editing.

## **Templates**

| Framework     | Description                              | Links                                    |
| ------------- | ---------------------------------------- | ---------------------------------------- |
| **Next.js**   | CMS built with Next.js App Router        | [→ Go to Next.js Starter](./nextjs)      |
| **Nuxt**      | CMS template using Nuxt 4                | [→ Go to Nuxt Starter](./nuxt)           |
| **Astro**     | CMS optimized for performance with Astro | [→ Go to Astro Starter](./astro)         |
| **SvelteKit** | CMS template using SvelteKit             | [→ Go to SvelteKit Starter](./sveltekit) |

## **Features**

All templates include:

- **Dynamic Page Builder**: CMS-driven pages assembled from reusable blocks (hero, rich text, gallery, pricing, forms,
  posts)
- **Blog**: Dynamic blog post listing and detail pages
- **Dynamic Forms**: Form builder with validation and Directus form submission storage
- **Live Preview & Visual Editing**: Real-time content preview and in-context editing via the Directus visual editor
- **Draft Content Support**: Preview unpublished content via Directus 12's `draft` versions (`version=published` is the
  live content; the legacy `version=main` key still works)
- **SEO**: Per-page metadata management
- **Dark Mode**: Built-in theme toggling

## **Directus Version**

These templates target **Directus 12** and run on the free core tier out of the box. Licensing and RBAC: [`directus/README.md`](./directus/README.md).

## **Folder Structure**

Each subfolder contains:

- **Source Code**: Framework-specific implementation
- **Documentation**: Setup and customization instructions

## Local Setup (with CLI)

Run this in your terminal:

```bash
npx directus-template-cli@latest init
```
