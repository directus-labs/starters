# Directus CMS Template - Local Development Setup

This directory contains the Docker Compose configuration for running Directus locally. The CMS template files are included in the `template/` directory, but you'll need to apply them using the Directus template CLI tool.

## Quick Start

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Start Directus:
   ```bash
   docker compose up -d
   ```

3. Access Directus at `http://localhost:8055` and complete the admin setup on first launch.

4. Generate a static access token:
   - Go to the **Users Directory** in Directus
   - Select your administrative user
   - Scroll down to the **Token** field and generate a new token
   - Copy the token and **save the user** to confirm

5. Apply the CMS template using the Directus template CLI:

   **Interactive mode** (recommended for first-time setup and security):
   ```bash
   npx directus-template-cli@latest apply
   ```
   
   Follow the interactive prompts:
   - **Template Source**: Choose "Local directory"
   - **Template Location**: Enter `./template` (relative to this directory)
   - **Directus URL**: Enter `http://localhost:8055`
   - **Authentication**: Select "Directus Access Token" and provide the token from step 4
   
   > **Security Note:** Interactive mode is recommended as it prompts for your token securely rather than passing it on the command line. The token is not displayed in your terminal history or process lists.
   
   **Programmatic mode** (for automation/scripts):
   ```bash
   npx directus-template-cli@latest apply -p \
     --directusUrl="http://localhost:8055" \
     --directusToken="YOUR_TOKEN_HERE" \
     --templateLocation="./template" \
     --templateType="local"
   ```
   
   > **Security Warning:** Passing admin tokens on the command line exposes them in process lists and shell history. For production or shared systems, consider:
   > - Using environment variables: `DIRECTUS_TOKEN=your_token npx directus-template-cli@latest apply -p ...`
   > - Using a temporary token with limited scope
   > - Reviewing the [directus-template-cli package](https://www.npmjs.com/package/directus-template-cli) before use
   
   This will load all collections, fields, permissions, and content from the template into your Directus instance.

## Content Security Policy (CSP) and Preview Issues

When using Directus Visual Editor with a local development server, you may encounter CSP errors that prevent the preview from working.

### For Local Docker Setup

The `.env.example` file includes the correct CSP settings for local development. When you copy `.env.example` to `.env` (as shown in the Quick Start), the `CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC` will be configured with common localhost ports:

- `http://localhost:3000` (Next.js, Nuxt default port)
- `http://localhost:4321` (Astro default port)
- `http://localhost:5173` (SvelteKit/Vite default port)

If you're using a different port, add it to the `CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC` value in your `.env` file and restart Directus:

```bash
docker compose restart directus
```

### For Directus Cloud

Directus Cloud requires HTTPS for previews. You'll need to expose your localhost with HTTPS using a tunneling service like [ngrok](https://ngrok.com/), [localtunnel](https://localtunnel.github.io/www/), or [serveo](https://serveo.net/).

**For complete documentation on configuring CSP for the Visual Editor, see the [official Directus documentation](https://directus.io/docs/guides/content/visual-editor/frontend-library).**

## Environment Variables

See `.env.example` for all available configuration options. Key variables include:

- `DIRECTUS_PORT`: Port for Directus (default: 8055)
- `PUBLIC_URL`: Public URL of your Directus instance
- `CORS_ORIGIN`: Allowed CORS origins (use `*` for local dev, specific origins for production)
- `CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC`: CSP frame-src directive for preview functionality

## Troubleshooting

### Database Migration Errors

If you encounter migration errors like "column already exists", reset the database:

```bash
docker compose down -v
rm -rf data/database
docker compose up -d
```

**Warning:** This will delete all data in your local Directus instance.

### Preview Not Working

1. Check that your `.env` file has the correct `CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC` value
2. Verify your frontend is running on one of the ports listed in the CSP
3. Restart Directus after making CSP changes: `docker compose restart directus`
4. Check browser console for CSP violation errors

## Additional Resources

- [Directus Documentation](https://docs.directus.io/)
- [Visual Editor Frontend Library Guide](https://directus.io/docs/guides/content/visual-editor/frontend-library) - Complete guide on configuring CSP and Visual Editor
- [Directus Community Forum](https://community.directus.io/)
