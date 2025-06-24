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

	[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/directus-labs/starters/tree/main/cms/next&env=NEXT_PUBLIC_DIRECTUS_URL,DIRECTUS_PUBLIC_TOKEN)

	[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/directus-labs/starters&base=cms/next)

	### Nuxt.js

	[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/directus-labs/starters/tree/main/cms/nuxt&env=DIRECTUS_URL,DIRECTUS_SERVER_TOKEN)

	[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/directus-labs/starters&base=cms/nuxt)

	### Astro

	[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/directus-labs/starters/tree/main/cms/astro&env=PUBLIC_DIRECTUS_URL,DIRECTUS_PUBLIC_TOKEN)

	[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/directus-labs/starters&base=cms/astro)

	### SvelteKit

	[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/directus-labs/starters/tree/main/cms/svelte&env=PUBLIC_DIRECTUS_URL,PUBLIC_DIRECTUS_TOKEN)

	[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/directus-labs/starters&base=cms/svelte)

---

## Required Environment Variables

Each framework requires the following environment variables, the URL of your directus project and the static token you set up in step 3:

### Astro
```
PUBLIC_DIRECTUS_URL=https://your-project.directus.app
DIRECTUS_PUBLIC_TOKEN=your-access-token
```

### Next.js
```
NEXT_PUBLIC_DIRECTUS_URL=https://your-project.directus.app
DIRECTUS_PUBLIC_TOKEN=your-access-token
```

### Nuxt
```
DIRECTUS_URL=https://your-project.directus.app
DIRECTUS_SERVER_TOKEN=your-access-token
```

### SvelteKit
```
PUBLIC_DIRECTUS_URL=https://your-project.directus.app
PUBLIC_DIRECTUS_TOKEN=your-access-token
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

### 3. Update your .env with the url and static token
   - This will start Directus on [http://localhost:8055](http://localhost:8055). Use the following credentials to log in:
     - **Admin Email**: `admin@example.com`
     - **Admin Password**: `d1r3ctu5`

   - Generate a static token for the admin user:

        - Go to the **Users Directory**
        - Choose the Administrative User
        - Scroll down to the **Token** field and generate a static token.
        - Copy the token and save it. **Do not forget to save the user**, or you will encounter an "Invalid token" error.
---
