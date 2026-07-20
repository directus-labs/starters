# RBAC source (maintainers only)

> **Not for starter users.** People applying these templates use the pre-built JSON in `cms/directus/template/` and `template-licensed/`. They never run codegen. User docs: [`cms/directus/README.md`](../../cms/directus/README.md).

This folder is the **single source of truth** for CMS permission rules. When you change RBAC here, regenerate the template files so git and CI stay in sync.

## Why codegen exists

Licensed rules live in small module files (`licensed/modules/*.json`) instead of one giant hand-edited `permissions.json`. The codegen script:

1. Merges modules → `cms/directus/template-licensed/src/permissions.json`
2. Flattens those rules → `cms/directus/template/src/permissions.json` (core tier: empty filters)
3. Copies the licensed template tree and syncs skeleton RBAC files
4. Applies the cms-i18n delta → `cms-i18n/directus/template/src/permissions.json`

**Do not edit generated permission files in the template folders by hand** — change source here, then run codegen.

## Codegen vs sync-licensed vs template apply

| | Audience | Purpose |
|--|----------|---------|
| **Template apply** (`directus-template-cli`) | Starter users | Load schema + permissions from committed JSON on a **new or reset** instance |
| **`pnpm rbac:sync-licensed`** | Starter users upgrading core → licensed | PATCH permission rules on a **live** instance; also removes circular redirects and patches Redirect automation (Path 2 — do not re-apply template) |
| **`pnpm rbac:codegen`** | **This repo's maintainers** | Rebuild committed template JSON **after you edit `_shared/rbac/`** |

Codegen updates files in git. Sync-licensed calls the Directus API. Template apply imports from git. Three different layers — not interchangeable.

## When to run codegen

Run from the **repo root** after any change under `_shared/rbac/`:

```bash
pnpm rbac:codegen
```

Then commit the generated outputs (template permissions, template-licensed tree, cms-i18n permissions).

CI runs `pnpm rbac:codegen:check` — it fails if generated files drift from source. Fix with `pnpm rbac:codegen` and commit.

## Layout

| Path | Edit this? | Purpose |
|------|------------|---------|
| `core-skeleton/` | Yes | Shared `roles.json`, `policies.json`, `access.json` |
| `licensed/modules/*.json` | Yes | Focused rule sets merged into licensed permissions |
| `licensed/permissions.json` | Generated | Merged reference (codegen output) |
| `cms-i18n-permissions.delta.json` | Yes | Extra permission rows for cms-i18n only |

## Licensed modules

- **public-api-filters** — Public policy: published status, active nav/forms
- **writer-self-access** — Content - Self: author-scoped posts
- **content-manage-rules** — Content - Manage: globals field list
- **form-submission-hardening** — Forms - Submission: upload folder, size limit
- **live-preview-access** — Content - Live Preview read rules
- **studio-team-rules** — Team - App Access: shares, flows, ai_prompts
