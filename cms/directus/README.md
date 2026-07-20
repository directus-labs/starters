# Directus CMS — local setup

Docker Compose for Directus 12 and the CMS template (`template/`). Apply the template with [directus-template-cli](https://www.npmjs.com/package/directus-template-cli).

## Quick start

1. `cp .env.example .env` and start Directus:

   ```bash
   docker compose up -d
   ```

2. Open `http://localhost:8055`, complete onboarding, and create your admin account.

3. Generate a static token on that admin user (Users Directory → Token → **Save**). Use it for template apply and `DIRECTUS_SERVER_TOKEN` in your frontend `.env`.

4. Apply the template (from this directory):

   ```bash
   npx directus-template-cli@latest apply
   ```

   - **Template Source:** Local directory  
   - **Template Location:** `./template` (core, default)  
   - **Directus URL:** `http://localhost:8055`  
   - **Token:** your admin static token  

   Programmatic apply:

   ```bash
   npx directus-template-cli@latest apply -p \
     --directusUrl="http://localhost:8055" \
     --directusToken="YOUR_TOKEN" \
     --templateLocation="./template" \
     --templateType="local"
   ```

5. Connect a frontend (e.g. `../nextjs`): copy its `.env.example`, set `NEXT_PUBLIC_DIRECTUS_URL`, `DIRECTUS_SERVER_TOKEN`, and `NEXT_PUBLIC_SITE_URL`.

After apply you should see **3 users**: your admin, Frontend Bot, and Content Writer (`writer@example.com`).

## Licensing and RBAC

Two template folders share the same schema and content; only `permissions.json` differs:

| Variant | Folder | License | Permission rules |
|---------|--------|---------|------------------|
| **Core** (default) | `template/` | Not required | Full roles/policies; flat rules (free tier) |
| **Licensed** | `template-licensed/` | `LICENSE_KEY` active | Same structure + enforceable filters, validation, presets |

**Activate a license:** set `LICENSE_KEY` in **this directory's** `.env` (the file `docker compose` reads), then recreate Directus:

```bash
docker compose up -d --force-recreate directus
```

Confirm under **Settings → License**. Requires a valid absolute `PUBLIC_URL` (e.g. `http://localhost:8055`).

### RBAC model

```
Roles (4)          Policies (7)              Users (3 seats)
─────────          ─────────────             ─────────────────
Writer      ──►   Content - Self            Your admin → Administrator + Live Preview
Editor      ──►   Content - Manage          Frontend Bot → Forms - Submission
Content Admin ──► Content - Manage          Content Writer → Writer
Administrator     Content - Public
                  Content - Live Preview
                  Forms - Submission
                  Team - App Access
                  Administrator
```

Editor and Content Admin are role definitions without seed users — assign them when you add a 4th seat.

| | Core | Licensed |
|--|------|----------|
| Writer in Studio | Can edit all content (flat rules) | Own posts only |
| Public API | Frontends filter published content | + API-level published/active filters |
| Frontend Bot | Forms policy | + upload folder preset, size validation |

Definitions: `template/src/{roles,policies,access,permissions}.json`.

### With a license — two paths

**Path 1 — Fresh instance (license from the start)**

```bash
docker compose down -v && docker compose up -d
# onboarding + admin token, then:
npx directus-template-cli@latest apply -p \
  --templateLocation="./template-licensed" \
  --templateType="local" \
  --directusUrl="http://localhost:8055" \
  --directusToken="YOUR_ADMIN_TOKEN"
```

**Path 2 — Already applied core `template/`, add license later**

Do **not** re-run `directus-template-cli apply` for licensing — that re-imports content, does not replace permission rows, and can trigger Redirect automation that creates broken `/` → `/` redirects.

After the license is active, from the **repo root**:

```bash
pnpm rbac:sync-licensed
```

This PATCHes licensed permission rules only, removes any circular redirects, and patches the Redirect automation flow. Reads `PUBLIC_URL` from this `.env` and an admin token from a frontend `.env` (e.g. `cms/nextjs/.env`). Restart your frontend dev server afterward.

**Verify:** Settings → Access Control → Permissions → Content - Public → pages → read — should show filters (`status = published`), not empty `{}`.

> **Maintainers:** Permission JSON in `template/` and `template-licensed/` is **generated** from [`_shared/rbac/`](../../_shared/rbac/README.md). Edit source there and run `pnpm rbac:codegen` — not the same as `rbac:sync-licensed`, which is for users upgrading a live instance.

## Content versioning

Pages and posts use Directus content versioning. Live content is `version=published` (formerly `main`); every item also has a `draft` version. Frontends in this repo handle both keys.

## AI and forms

- **AI:** Built-in Directus AI Assistant (**Settings → AI**). Example prompts ship in `ai_prompts`.
- **Form emails:** Optional — configure `EMAIL_*` in `.env`. Submissions are stored in Directus either way.

## Content Security Policy (preview)

`.env.example` includes `CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC` for common dev ports (3000, 4321, 5173). Add your port and `docker compose restart directus` if needed.

For Cloud previews, use an HTTPS tunnel (ngrok, etc.). See the [Visual Editor docs](https://directus.io/docs/guides/content/visual-editor/frontend-library).

## Troubleshooting

**`custom_permission_rules_enabled` (403) on core apply** — Expected. The CLI probes licensed features; core template uses flat rules. OK if you see `Loading 149 permissions... done`.

**401 from frontend after DB reset** — Regenerate `DIRECTUS_SERVER_TOKEN` on your admin user and restart the dev server.

**Frontend blank / infinite redirect on `/`** — Usually circular redirects in Directus (`/` → `/`). Run `pnpm rbac:sync-licensed` from the repo root (Path 2 upgrade), or delete them in **Content → Redirects**, then restart the frontend dev server.

**Database migration errors** — `docker compose down -v`, remove `data/database`, `docker compose up -d` (destroys local data).

## Resources

- [Directus docs](https://docs.directus.io/)
- [Visual Editor guide](https://directus.io/docs/guides/content/visual-editor/frontend-library)
