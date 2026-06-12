# directus-template-cli integration (proposed — not implemented)

> **Status:** The published `directus-template-cli` does **not** implement any of this yet. Today, core and licensed templates are applied the same way: run `apply` and set `--templateLocation` to `./template` or `./template-licensed` yourself. License setup is manual (`LICENSE_KEY` in `.env` or Studio). This doc is a design note for a future CLI release.

Implementation would live in the [directus-template-cli](https://www.npmjs.com/package/directus-template-cli) package (separate repo). `cms/package.json` already reserves `directus:template.variants.licensed` metadata for when that ships.

## `init` — license prompt (proposed)

After selecting the CMS starter, prompt:

> Do you have a Directus license key?

- **No** → write empty `LICENSE_KEY=` in `.env`, recommend applying `./directus/template` (core)
- **Yes** → prompt for key, write `LICENSE_KEY=...`, recommend `./directus/template-licensed`

## `apply` — tier selection (proposed)

Read `directus:template` from `cms/package.json`:

| Flag / prompt | Template path | When |
|---------------|---------------|------|
| Default | `./directus/template` | No license, or `--tier=core` |
| `--tier=licensed` | `./directus/template-licensed` | Active `LICENSE_KEY` on target instance |

If `--tier=licensed` is requested but the instance has no active license, warn and fall back to core (or abort with a clear message).

## `cms-i18n` guard (proposed)

`cms-i18n/package.json` sets `"requiresLicense": true` on `directus:template` for catalog metadata. A future CLI could refuse to apply cms-i18n without confirming a license, since the schema exceeds core collection limits. **Today the CLI does not read this flag** — you must configure `LICENSE_KEY` yourself before apply.

## Catalog metadata (reserved)

```json
{
  "tier": "core",
  "template": "./directus/template",
  "variants": {
    "licensed": {
      "name": "CMS — Full RBAC",
      "template": "./directus/template-licensed",
      "requiresLicense": true
    }
  }
}
```

## Re-apply for late license adopters

Projects that started on core can add `LICENSE_KEY` and re-apply `template-licensed` on a fresh instance (or use template-cli merge strategies when available).
