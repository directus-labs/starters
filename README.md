# Directus Starter Templates

This repo provides a collection of starter templates for building web applications with Directus integration.

Each template is designed to be:

- **Reusable**: Modular codebases that can be easily extended.
- **Framework-Specific**: Tailored implementations for popular frameworks like Next.js, Nuxt, SvelteKit, and Astro.
- **Scalable**: Suitable for small to medium projects and scalable to larger applications.

---

## **Available Templates**

### CMS

A full-featured CMS starter with pages, blog posts, dynamic forms, live preview, and visual editing.

| Framework     | Source                                                                             | Deploy                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js**   | [cms/nextjs](https://github.com/directus-labs/starters/tree/main/cms/nextjs)       | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/directus-labs/starters/tree/main/cms/nextjs&env=NEXT_PUBLIC_DIRECTUS_URL,NEXT_PUBLIC_SITE_URL,DIRECTUS_SERVER_TOKEN,NEXT_PUBLIC_ENABLE_VISUAL_EDITING) [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/directus-labs/starters&branch=main&create_from_path=cms/nextjs) |
| **Nuxt**      | [cms/nuxt](https://github.com/directus-labs/starters/tree/main/cms/nuxt)           | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/directus-labs/starters/tree/main/cms/nuxt&env=DIRECTUS_URL,NUXT_PUBLIC_SITE_URL,DIRECTUS_SERVER_TOKEN,NUXT_PUBLIC_ENABLE_VISUAL_EDITING) [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/directus-labs/starters&branch=main&create_from_path=cms/nuxt)                 |
| **Astro**     | [cms/astro](https://github.com/directus-labs/starters/tree/main/cms/astro)         | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/directus-labs/starters/tree/main/cms/astro&env=PUBLIC_DIRECTUS_URL,PUBLIC_SITE_URL,DIRECTUS_SERVER_TOKEN,PUBLIC_ENABLE_VISUAL_EDITING) _(Vercel only — [see README to switch adapters](https://github.com/directus-labs/starters/tree/main/cms/astro#-one-click-deploy))_     |
| **SvelteKit** | [cms/sveltekit](https://github.com/directus-labs/starters/tree/main/cms/sveltekit) | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/directus-labs/starters/tree/main/cms/sveltekit&env=PUBLIC_DIRECTUS_URL,PUBLIC_SITE_URL,DIRECTUS_SERVER_TOKEN,PUBLIC_ENABLE_VISUAL_EDITING) _(Vercel only — [see README to switch adapters](https://github.com/directus-labs/starters/tree/main/cms/sveltekit#-one-click-deploy))_ |

> **Adapter note:** Astro and SvelteKit only support one deployment adapter at a time. Both starters default to Vercel. To deploy to Netlify or another provider, swap the adapter in the config before deploying — see each template's README for instructions.

→ [View CMS templates](./cms/)

### CMS with i18n

The same CMS starter with built-in internationalization: locale-based routing, Directus translation integration, and a
language switcher.

| Framework   | Source                                                                                 | Deploy                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js** | [cms-i18n/nextjs](https://github.com/directus-labs/starters/tree/main/cms-i18n/nextjs) | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/directus-labs/starters/tree/main/cms-i18n/nextjs&env=NEXT_PUBLIC_DIRECTUS_URL,NEXT_PUBLIC_SITE_URL,DIRECTUS_SERVER_TOKEN,NEXT_PUBLIC_ENABLE_VISUAL_EDITING) [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/directus-labs/starters&branch=main&create_from_path=cms-i18n/nextjs) |
| **Nuxt**    | [cms-i18n/nuxt](https://github.com/directus-labs/starters/tree/main/cms-i18n/nuxt)     | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/directus-labs/starters/tree/main/cms-i18n/nuxt&env=DIRECTUS_URL,NUXT_PUBLIC_SITE_URL,DIRECTUS_SERVER_TOKEN,NUXT_PUBLIC_ENABLE_VISUAL_EDITING) [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/directus-labs/starters&branch=main&create_from_path=cms-i18n/nuxt)                 |

→ [View CMS i18n templates](./cms-i18n/)

---

## **Required Environment Variables**

Each framework requires your Directus URL, a server-side token, and a site URL. The token (`DIRECTUS_SERVER_TOKEN`)
comes from your **Webmaster** account and is used server-side for content access, preview, and form submissions. See the
individual template README for full setup details.

### CMS — Next.js

```
NEXT_PUBLIC_DIRECTUS_URL=https://your-project.directus.app
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DIRECTUS_SERVER_TOKEN=your-webmaster-token
NEXT_PUBLIC_ENABLE_VISUAL_EDITING=true
```

### CMS — Nuxt

```
DIRECTUS_URL=https://your-project.directus.app
NUXT_PUBLIC_SITE_URL=http://localhost:3000
DIRECTUS_SERVER_TOKEN=your-webmaster-token
NUXT_PUBLIC_ENABLE_VISUAL_EDITING=true
```

### CMS — Astro

```
PUBLIC_DIRECTUS_URL=https://your-project.directus.app
PUBLIC_SITE_URL=http://localhost:3000
DIRECTUS_SERVER_TOKEN=your-webmaster-token
PUBLIC_ENABLE_VISUAL_EDITING=true
```

### CMS — SvelteKit

```
PUBLIC_DIRECTUS_URL=https://your-project.directus.app
PUBLIC_SITE_URL=http://localhost:3000
DIRECTUS_SERVER_TOKEN=your-webmaster-token
PUBLIC_ENABLE_VISUAL_EDITING=true
```

### CMS i18n — Next.js

```
NEXT_PUBLIC_DIRECTUS_URL=https://your-project.directus.app
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DIRECTUS_SERVER_TOKEN=your-webmaster-token
NEXT_PUBLIC_ENABLE_VISUAL_EDITING=true
```

### CMS i18n — Nuxt

```
DIRECTUS_URL=https://your-project.directus.app
NUXT_PUBLIC_SITE_URL=http://localhost:3000
DIRECTUS_SERVER_TOKEN=your-webmaster-token
NUXT_PUBLIC_ENABLE_VISUAL_EDITING=true
```

> **Note:** A `DIRECTUS_ADMIN_TOKEN` is also needed locally for type generation (`pnpm run generate:types`). This is the
> token from your Admin account and should never be used at runtime or committed to version control.

---

## **Getting Started**

### **Using Directus with a Cloud Instance (Recommended)**

1. **Create a New Project**:

   - Visit [Directus Cloud](https://directus.io/cloud/) and create a new project.
   - During setup, select the **CMS** template.
   - Once started, it will take around 90 seconds for the Cloud Project to be created.
   - You will receive an email with your project URL, email, and password for logging in.

2. **Access Your New Project**:

   - Log in to your project using the URL provided in your email or from the Directus Cloud Dashboard.

3. **Create accounts and generate tokens**:

   - Go to the **Users Directory** and create a **Webmaster** user account.
   - Scroll down to the **Token** field, generate a static token, and save it — this is your `DIRECTUS_SERVER_TOKEN`.
   - For local type generation, you can also generate a token on the **Admin** user — this is your
     `DIRECTUS_ADMIN_TOKEN` (never exposed at runtime).
   - **Do not forget to save the user**, or you will encounter an "Invalid token" error.

4. **Connect to a Frontend Template**:

   Use one of the one-click deploy buttons above, or clone the source and follow the setup instructions in the
   template's README.

---

### **Deploying Directus on Railway**

Prefer to self-host? You can deploy Directus with the CMS schema pre-loaded directly to Railway.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/directus-cms?referralCode=b2RDZT&utm_medium=integration&utm_source=template&utm_campaign=generic)

This sets up a hosted Directus instance with the CMS template already applied. Once deployed:

1. Open your Railway project and grab the public URL for your Directus service — this is your `DIRECTUS_URL`.
2. Log in to Directus, go to the **Users Directory**, and create a **Webmaster** user.
3. Generate a static token for that user — this is your `DIRECTUS_SERVER_TOKEN`.
4. Choose a frontend starter from the table above and follow the setup instructions in its README.

---

### **Using Directus Locally**

## Local Development with CLI

Prefer to run everything locally? You can use Docker and our CLI tool to scaffold and launch a full Directus + frontend
setup.

### 1. Install Docker

Download and install Docker:
[https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

### 2. Scaffold Your Project

Open your terminal and run:

```bash
npx directus-template-cli@latest init
```

Follow the prompts to:

- Choose a project name
- Select a backend template
- Select a frontend framework
- Decide whether to install dependencies automatically

This sets up a local project with Docker-based Directus + frontend integration.

### 3. Complete Directus setup and generate tokens

- This will start Directus on [http://localhost:8055](http://localhost:8055)
- On first launch, you'll be prompted to complete the admin setup
- After setup, create a **Webmaster** user and generate a static token for `DIRECTUS_SERVER_TOKEN`
- Optionally generate a token on the Admin user for `DIRECTUS_ADMIN_TOKEN` (type generation only)

---

## Troubleshooting

### Preview Not Working - Content Security Policy (CSP) Issues

If you encounter CSP errors when using the Visual Editor preview, this is typically due to Content Security Policy
restrictions.

**For Local Docker Setup:** See
[`cms/directus/README.md`](cms/directus/README.md#content-security-policy-csp-and-preview-issues) for configuration
details.

**For Directus Cloud:** You'll need to expose your localhost with HTTPS using a tunneling service (ngrok, localtunnel,
etc.).

**For complete documentation on configuring CSP for the Visual Editor, see the
[official Directus documentation](https://directus.io/docs/guides/content/visual-editor/frontend-library).**

---

## Contributing

Have a bug report, feature request, or question? Please
[open an issue](https://github.com/directus-labs/starters/issues) rather than submitting a pull request directly.

### Repo Structure

```
├── cms/                  # CMS starter templates (Next.js, Nuxt, Astro, SvelteKit)
├── cms-i18n/             # CMS starter templates with i18n support (Next.js, Nuxt)
├── blank/                # Blank starter template
├── _shared/              # Shared files (docker-compose, .env.example)
├── _scripts/             # Internal build/validation scripts
└── .github/              # CI workflows
```

Directories prefixed with `_` or `.` are internal and excluded from the template CLI.

### Validation

Run `node _scripts/validate-templates.js` to check all templates have the required structure and metadata.
