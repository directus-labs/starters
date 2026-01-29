# Directus Starter Templates

This repo provides a collection of starter templates for building web applications with Directus integration.

Each template is designed to be:

- **Reusable**: Modular codebases that can be easily extended.
- **Framework-Specific**: Tailored implementations for popular frameworks like Next.js, Nuxt.js, Svelte, and Astro.
- **Scalable**: Suitable for small to medium projects and scalable to larger applications.

---

## **Current and Upcoming Templates**

| Template             | Status         | Description                                  |
| -------------------- | -------------- | -------------------------------------------- |
| **CMS**       | 🚧 In Progress | A starter CMS template for managing content. |
| **Headless eCommerce** | 🕒 Upcoming    | A template for building eCommerce solutions. |

---

## **Getting Started**

### **Using Directus with a Cloud Instance (Recommended)**

1. **Create a New Project**:

   - Visit [Directus Cloud](https://directus.io/cloud/) and create a new project.
   - During the setup process, be sure to select the appropriate template for your project (**CMS**, **Simple CRM**, or **Simple eCommerce**).
   - Once started, it will take around 90 seconds for the Cloud Project to be created.
   - You will receive an email with your project URL, email, and password for logging in.
   - If you used GitHub to create your account, this will be your GitHub email.

2. **Access Your New Project**:

   - Log in to your project using the URL provided in your email or from the Directus Cloud Dashboard.

3. **Generate a static token for the admin user**:
   
   - Go to the **Users Directory**
   - Choose the Administrative User
   - Scroll down to the **Token** field and generate a static token.
   - Copy the token and save it. **Do not forget to save the user**, or you will encounter an "Invalid token" error.

4. **Connect to Frontend Template**:

	### 🚀 One-Click Deploy (Recommended for Beginners)

	Want to use **Directus Cloud** and deploy a frontend instantly? Choose your framework below:

	### Next.js

	[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/directus-labs/starters/tree/main/cms/nextjs&env=NEXT_PUBLIC_DIRECTUS_URL,NEXT_PUBLIC_SITE_URL,DIRECTUS_PUBLIC_TOKEN,NEXT_PUBLIC_ENABLE_VISUAL_EDITING)

	[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/directus-labs/starters&branch=main&create_from_path=cms/nextjs)  

	---

	### Nuxt

	[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/directus-labs/starters/tree/main/cms/nuxt&env=DIRECTUS_URL,NUXT_PUBLIC_SITE_URL,DIRECTUS_SERVER_TOKEN,NUXT_PUBLIC_ENABLE_VISUAL_EDITING)

	[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/directus-labs/starters&branch=main&create_from_path=cms/nuxt)  

	---

	### Astro


	[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/directus-labs/starters/tree/main/cms/astro&env=PUBLIC_DIRECTUS_URL,PUBLIC_SITE_URL,DIRECTUS_PUBLIC_TOKEN,PUBLIC_ENABLE_VISUAL_EDITING)


	**Adapter info:**  
	Astro only supports one adapter at a time.  
	This starter is set up for Vercel by default.  
	See the [framework’s repo](https://github.com/directus-labs/starters/tree/main/cms/astro) for instructions on switching adapters.


	---

	### SvelteKit

	[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/directus-labs/starters/tree/main/cms/sveltekit&env=PUBLIC_DIRECTUS_URL,PUBLIC_SITE_URL,PUBLIC_DIRECTUS_TOKEN,PUBLIC_ENABLE_VISUAL_EDITING,PUBLIC_DIRECTUS_FORM_TOKEN,DRAFT_MODE_SECRET)

	> **Note:**  
	> SvelteKit requires a few extra environment variables at deploy time:  
	> - `PUBLIC_DIRECTUS_FORM_TOKEN`
	> - `DRAFT_MODE_SECRET`
	>
	> When getting started, you can use the same static token for  
	> `PUBLIC_DIRECTUS_FORM_TOKEN`, `DRAFT_MODE_SECRET`, and `PUBLIC_DIRECTUS_TOKEN`.  
	> For better security, **configure separate tokens with only the required permissions** for each variable after setup.

	---

	**Adapter info:**  
	SvelteKit only supports one adapter at a time.  
	This starter is set up for Vercel by default.  
	See the [framework’s repo](https://github.com/directus-labs/starters/tree/main/cms/sveltekit) for instructions on switching adapters.



---

## Required Environment Variables

Each framework requires your Directus endpoint, static token, and a `SITE_URL` that points to where the frontend will be served. If you don’t yet know your public URL, you can use `http://localhost:3000` (or your local dev port) and update later.



### Next.js
```
NEXT_PUBLIC_DIRECTUS_URL=https://your-project.directus.app
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DIRECTUS_PUBLIC_TOKEN=your-access-token
NEXT_PUBLIC_ENABLE_VISUAL_EDITING=true
```

### Nuxt
```
DIRECTUS_URL=https://your-project.directus.app
NUXT_PUBLIC_SITE_URL=http://localhost:3000
DIRECTUS_SERVER_TOKEN=your-access-token
NUXT_PUBLIC_ENABLE_VISUAL_EDITING=true
```
### Astro
```
PUBLIC_DIRECTUS_URL=https://your-project.directus.app
PUBLIC_SITE_URL=http://localhost:3000
DIRECTUS_PUBLIC_TOKEN=your-access-token
PUBLIC_ENABLE_VISUAL_EDITING=true
```

### SvelteKit
```
PUBLIC_DIRECTUS_URL=https://your-project.directus.app
PUBLIC_SITE_URL=http://localhost:3000
PUBLIC_DIRECTUS_TOKEN=your-access-token
PUBLIC_ENABLE_VISUAL_EDITING=true
PUBLIC_DIRECTUS_FORM_TOKEN=user-with-form-permissions
DRAFT_MODE_SECRET=live-preview-token
```

---

### **Using Directus Locally**

## Local Development with CLI

Prefer to run everything locally? You can use Docker and our CLI tool to scaffold and launch a full Directus + frontend setup.

### 1. Install Docker

Download and install Docker: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

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

### 3. Complete Directus setup and generate a static token
   - This will start Directus on [http://localhost:8055](http://localhost:8055)
   - On first launch, you'll be prompted to complete the admin setup
   - After setup, generate a static token for the admin user:
        - Go to the **Users Directory**
        - Choose the Administrative User
        - Scroll down to the **Token** field and generate a static token
        - Copy the token and save it. **Do not forget to save the user**, or you will encounter an "Invalid token" error

---

## Troubleshooting

### Preview Not Working - Content Security Policy (CSP) Issues

If you encounter CSP errors when using the Visual Editor preview, this is typically due to Content Security Policy restrictions.

**For Local Docker Setup:** See [`cms/directus/README.md`](cms/directus/README.md#content-security-policy-csp-and-preview-issues) for configuration details.

**For Directus Cloud:** You'll need to expose your localhost with HTTPS using a tunneling service (ngrok, localtunnel, etc.).

**For complete documentation on configuring CSP for the Visual Editor, see the [official Directus documentation](https://directus.io/docs/guides/content/visual-editor/frontend-library).**

---
