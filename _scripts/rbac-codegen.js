#!/usr/bin/env node

/**
 * Generates RBAC files for cms core + licensed template variants from _shared/rbac/.
 *
 * Usage:
 *   node _scripts/rbac-codegen.js
 *   node _scripts/rbac-codegen.js --check
 */

import { readFileSync, writeFileSync, existsSync, cpSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const RBAC = join(ROOT, '_shared/rbac');
const CMS_TEMPLATE = join(ROOT, 'cms/directus/template');
const CMS_LICENSED = join(ROOT, 'cms/directus/template-licensed');
const I18N_TEMPLATE = join(ROOT, 'cms-i18n/directus/template');
const CHECK = process.argv.includes('--check');

const RBAC_FILES = ['roles.json', 'policies.json', 'access.json', 'permissions.json'];

const LICENSED_MODULES = [
  'public-api-filters',
  'writer-self-access',
  'content-manage-rules',
  'live-preview-access',
  'form-submission-hardening',
  'studio-team-rules',
];

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function loadLicensedPermissions() {
  const modulesDir = join(RBAC, 'licensed/modules');

  if (existsSync(modulesDir)) {
    return LICENSED_MODULES.flatMap((name) => readJson(join(modulesDir, `${name}.json`)));
  
}
  return readJson(join(RBAC, 'licensed/permissions.json'));
}

function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

/** Flatten permission rows for core tier (no custom rules). */
function flattenPermissions(permissions) {
  return permissions.map((row) => ({
    ...row,
    permissions: {},
    validation: null,
    presets: null,
    fields: ['*'],
  }));
}

function copyTemplateTree(src, dest) {
  if (existsSync(dest)) {
    rmSync(dest, { recursive: true });
  }

  cpSync(src, dest, { recursive: true });
}

function syncLicensedTemplate() {
  const licensedPerms = loadLicensedPermissions();
  const skeleton = (name) => readJson(join(RBAC, 'core-skeleton', name));

  copyTemplateTree(CMS_TEMPLATE, CMS_LICENSED);

  const licensedSrc = join(CMS_LICENSED, 'src');
  writeJson(join(licensedSrc, 'roles.json'), skeleton('roles.json'));
  writeJson(join(licensedSrc, 'policies.json'), skeleton('policies.json'));
  writeJson(join(licensedSrc, 'access.json'), skeleton('access.json'));
  writeJson(join(licensedSrc, 'permissions.json'), licensedPerms);

  // Update licensed template README
  const licensedReadme = join(CMS_LICENSED, 'README.md'
);
  if (existsSync(licensedReadme)) {
    writeFileSync(
      licensedReadme,
      `Licensed CMS template variant — same schema as \`../template/\`, with enforceable permission rules. Requires an active \`LICENSE_KEY\`.

Setup and apply instructions: [\`../README.md\`](../README.md#licensing-and-rbac).
`,
      'utf8',
    );
  }
}

function syncCorePermissions() {
  const licensedPerms = loadLicensedPermissions();
  const flat = flattenPermissions(licensedPerms);
  const corePath = join(CMS_TEMPLATE, 'src/permissions.json');
  const current = readJson(corePath);

  // Preserve core skeleton files from disk (may include manual tweaks); sync skeleton copies
  for (const file of ['roles.json', 'policies.json', 'access.json']) {
    const src = join(CMS_TEMPLATE, 'src', file);
    writeJson(join(RBAC, 'core-skeleton', file), readJson(src));
  }

  if (CHECK) {
    if (JSON.stringify(current) !== JSON.stringify(flat)) {
      console.error('Core permissions.json drift — run: pnpm rbac:codegen');
      process.exit(1);
    }
  } else {
    writeJson(corePath, flat);
  }
}

/** cms-i18n: licensed permissions + translation collection rows */
function syncI18nPermissions() {
  const licensedPerms = loadLicensedPermissions();
  const i18nDeltaPath = join(RBAC, 'cms-i18n-permissions.delta.json');
  const i18nPermsPath = join(I18N_TEMPLATE, 'src/permissions.json');

  let merged = [...licensedPerms];

  if (existsSync(i18nDeltaPath)) {
    const delta = readJson(i18nDeltaPath);
    const key = (r) => `${r.policy}|${r.collection}|${r.action}`;
    const map = new Map(merged.map((r) => [key(r), r]));

    for (const row of delta) {
      map.set(key(row), row);
   
 }
    merged = [...map.values()];
  } else if (existsSync(i18nPermsPath)) {
    // Build delta from current i18n minus licensed collections on first run
    const current = readJson(i18nPermsPath);

    const licensedKeys = new Set(licensedPerms.map((r) => `${r.policy}|${r.collection}|${r.action}`));
    const delta = current.filter((r) => !licensedKeys.has(`${r.policy}|${r.collection}|${r.action}`));
   
 writeJson(i18nDeltaPath, delta);
    merged = [...licensedPerms, ...delta];
  }

  // Sync i18n skeleton RBAC (use cms core-skeleton; i18n uses translated policy label for Public only)
  const i18nPolicies = readJson(join(I18N_TEMPLATE, 'src/policies.json'));
  const publicPolicy = i18nPolicies.find((p) => p.id === 'abf8a154-5b1c-4a46-ac9c-7300570f4f17');
  if (publicPolicy) {
    publicPolicy.name = '$t:public_label';

  }

  for (const file of ['roles.json', 'access.json']) {
    writeJson(join(I18N_TEMPLATE, 'src', file), readJson(join(RBAC, 'core-skeleton', file)));
  }

  if (CHECK) {
    const currentPerms = readJson(i18nPermsPath);
    if (JSON.stringify(currentPerms) !== JSON.stringify(merged)) {
      console.error('cms-i18n permissions.json drift — run: pnpm rbac:codegen');
      process.exit(1);
    }
    const currentPolicies = readJson(join(I18N_TEMPLATE, 'src/policies.json'));
    if (JSON.stringify(currentPolicies) !== JSON.stringify(i18nPolicies)) {

      console.error('cms-i18n policies.json drift — run: pnpm rbac:codegen')
;
      process.exit(1);
    }
  } else {
    writeJson(i18nPermsPath, merged);
    writeJson(join(I18N_TEMPLATE, 'src/policies.json'), i18nPolicies);
  }
}

function checkLicensedTemplate(licensedPerms) {
  if (!existsSync(CMS_LICENSED)) {
    console.error('template-licensed/ missing — run: pnpm rbac:codegen');
    process.exit(1);
  }

  for (const file of RBAC_FILES) {
    const expected = file === 'permissions.json' ? licensedPerms : readJson(join(RBAC, 'core-skeleton', file));
    const actual = readJson(join(CMS_LICENSED, 'src', file));
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      console.error(`template-licensed/src/${file} drift — run: pnpm rbac:codegen`);

      process.exit(1);

    }
  }
}

console.log('RBAC codegen...\n');

const licensedPerms = loadLicensedPermissions();

syncCorePermissions();
if (!CHECK) {
  writeJson(join(RBAC, 'licensed/permissions.json'), licensedPerms);
  syncLicensedTemplate();

}
syncI18nPermissions();

if (CHECK) {
  checkLicensedTemplate(licensedPerms);
  console.log('RBAC outputs in sync.');
} else {
  console.log('Generated:');
  console.log('  - cms/directus/template/src/permissions.json (core, flat)');
  console.log('  - cms/directus/template-licensed/ (licensed variant)');
  console.log('  - cms-i18n/directus/template/src/permissions.json');
}
