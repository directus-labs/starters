#!/usr/bin/env node
/**
 * Move an existing CMS instance's post bylines from directus_users to the authors collection.
 *
 * Run from the repo root:
 *   pnpm cms:migrate-authors                 # cms core
 *   pnpm cms:migrate-authors --licensed      # cms with template-licensed applied
 *   pnpm cms:migrate-authors --i18n          # cms-i18n
 *   add --dry-run to print the plan without changing anything
 *
 * 1. Creates the authors collection (fields from the template)
 * 2. Creates an author for each user credited on a post (same id as the user), then repoints the
 *    posts.author relation. Post rows keep their values, since the ids match.
 * 3. Reconciles template permissions for authors, posts and directus_users
 *    (removes Public's directus_users read, adds the authors grants, updates writer ownership)
 * 4. Adds the default Authors list view
 * 5. Checks that anonymous requests can't read users but can read authors
 *
 * Safe to run more than once. Reads the Directus URL and admin token the same way as rbac:sync-licensed.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry-run');
const I18N = args.has('--i18n');
const LICENSED = args.has('--licensed') || I18N;
const PROJECT = I18N ? 'cms-i18n' : 'cms';
const TEMPLATE_DIR = join(ROOT, PROJECT, 'directus', I18N || !LICENSED ? 'template' : 'template-licensed', 'src');

/** Collections whose template permissions this migration owns. */
const PERMISSION_COLLECTIONS = ['authors', 'posts', 'directus_users'];

function loadEnvFile(path) {
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    const comment = value.indexOf(' #');
    if (comment !== -1) value = value.slice(0, comment).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(join(ROOT, PROJECT, 'directus/.env'));
for (const frontend of ['nextjs', 'nuxt', 'astro', 'sveltekit']) {
  loadEnvFile(join(ROOT, PROJECT, frontend, '.env'));
}

const DIRECTUS_URL = (
  process.env.DIRECTUS_URL ||
  process.env.PUBLIC_URL ||
  process.env.NEXT_PUBLIC_DIRECTUS_URL ||
  'http://localhost:8055'
).replace(/\/$/, '');
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

if (!TOKEN) {
  console.error('Missing admin token.');
  console.error(`Add DIRECTUS_ADMIN_TOKEN to a frontend .env (e.g. ${PROJECT}/nextjs/.env), or run:`);
  console.error('  DIRECTUS_ADMIN_TOKEN=your-token pnpm cms:migrate-authors');
  process.exit(1);
}

const readTemplate = (file) => JSON.parse(readFileSync(join(TEMPLATE_DIR, file), 'utf8'));
const templateFields = readTemplate('fields.json');
const templateRelations = readTemplate('relations.json');
const templateField = (collection, field) => templateFields.find((f) => f.collection === collection && f.field === field);
const templateRelation = (collection, field) =>
  templateRelations.find((r) => r.collection === collection && r.field === field);

async function request(path, options = {}, { auth = true } = {}) {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    ...options,
    headers: {
      ...(auth ? { Authorization: `Bearer ${TOKEN}` } : {}),
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

async function api(path, options = {}) {
  const { ok, status, body } = await request(path, options);
  if (!ok) {
    const msg = body?.errors?.[0]?.message || body?.message || status;
    throw new Error(`${options.method || 'GET'} ${path} failed (${status}): ${msg}`);
  }
  return body.data;
}

/** Writes go through here so --dry-run only prints them. */
async function write(label, path, method, payload) {
  console.log(`${DRY_RUN ? '[dry run] ' : ''}${label}`);
  if (DRY_RUN) return null;
  return api(path, { method, ...(payload === undefined ? {} : { body: JSON.stringify(payload) }) });
}

function fieldPayload(field) {
  const { meta, schema } = field;
  const { id, collection, field: name, ...restMeta } = meta ?? {};
  return {
    field: field.field,
    type: field.type,
    meta: restMeta,
    schema: schema ? { is_nullable: schema.is_nullable, default_value: schema.default_value } : null,
  };
}

function relationPayload(relation) {
  const { id, many_collection, many_field, one_collection, ...meta } = relation.meta ?? {};
  return {
    collection: relation.collection,
    field: relation.field,
    related_collection: relation.related_collection,
    schema: { on_delete: relation.schema?.on_delete ?? 'SET NULL' },
    meta,
  };
}

async function exists(path) {
  return (await request(path)).ok;
}

async function createAuthorsCollection() {
  if (await exists('/collections/authors')) {
    console.log('authors collection: already exists.');
    return;
  }

  const collection = readTemplate('collections.json').find((c) => c.collection === 'authors');
  const { collection: _name, ...meta } = collection.meta;
  const idField = templateField('authors', 'id');

  await write('Create authors collection', '/collections', 'POST', {
    collection: 'authors',
    meta,
    schema: {},
    fields: [{ ...fieldPayload(idField), schema: { is_primary_key: true, length: 36, has_auto_increment: false } }],
  });

  for (const name of ['name', 'avatar', 'bio']) {
    await write(`Create authors.${name}`, '/fields/authors', 'POST', fieldPayload(templateField('authors', name)));
  }

  await write('Create authors.avatar relation', '/relations', 'POST', relationPayload(templateRelation('authors', 'avatar')));
}

async function migratePostAuthors() {
  const relation = await request('/relations/posts/author');
  const target = relation.body?.data?.related_collection;

  if (target === 'authors') {
    console.log('posts.author: already points at authors.');
    return;
  }

  if (relation.ok && target !== 'directus_users') {
    throw new Error(`posts.author points at "${target}", not directus_users. Migrate it by hand.`);
  }

  const posts = await api('/items/posts?limit=-1&fields=id,author.id,author.first_name,author.last_name,author.avatar');
  const byUser = new Map();
  for (const post of posts) {
    if (!post.author?.id) continue;
    if (!byUser.has(post.author.id)) byUser.set(post.author.id, { user: post.author, posts: [] });
    byUser.get(post.author.id).posts.push(post.id);
  }

  // Reusing the user's id keeps every posts.author value valid, so post rows never need rewriting
  for (const { user, posts: keys } of byUser.values()) {
    if (await exists(`/items/authors/${user.id}`)) continue;
    const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Author';
    await write(`Create author "${name}" for ${keys.length} post(s)`, '/items/authors', 'POST', {
      id: user.id,
      name,
      avatar: user.avatar ?? null,
    });
  }

  if (await exists('/fields/directus_users/posts')) {
    await write('Remove directus_users.posts alias', '/fields/directus_users/posts', 'DELETE');
  }

  if (relation.ok) await write('Remove posts.author relation to directus_users', '/relations/posts/author', 'DELETE');

  if (!(await exists('/fields/authors/posts'))) {
    await write('Create authors.posts alias', '/fields/authors', 'POST', fieldPayload(templateField('authors', 'posts')));
  }

  await write('Create posts.author relation to authors', '/relations', 'POST', relationPayload(templateRelation('posts', 'author')));

  const { meta } = templateField('posts', 'author');
  await write('Update posts.author interface', '/fields/posts/author', 'PATCH', {
    meta: { interface: meta.interface, options: meta.options, display: meta.display, display_options: meta.display_options, note: meta.note },
  });
}

const permissionKey = (row) => `${row.collection}:${row.action}:${row.policy}`;
const permissionBody = (row) => ({
  permissions: row.permissions,
  validation: row.validation,
  presets: row.presets,
  fields: row.fields,
});

async function reconcilePermissions() {
  const policies = readTemplate('policies.json').map((p) => p.id);
  const wanted = readTemplate('permissions.json').filter(
    (row) => PERMISSION_COLLECTIONS.includes(row.collection) && policies.includes(row.policy),
  );
  const current = await api(
    `/permissions?limit=-1&fields=id,collection,action,policy,permissions,validation,presets,fields` +
      `&filter[collection][_in]=${PERMISSION_COLLECTIONS.join(',')}&filter[policy][_in]=${policies.join(',')}`,
  );

  const currentByKey = new Map(current.map((row) => [permissionKey(row), row]));
  const wantedKeys = new Set(wanted.map(permissionKey));
  let changes = 0;

  for (const row of wanted) {
    const existing = currentByKey.get(permissionKey(row));
    if (!existing) {
      await write(`Add permission ${permissionKey(row)}`, '/permissions', 'POST', {
        collection: row.collection,
        action: row.action,
        policy: row.policy,
        ...permissionBody(row),
      });
      changes++;
    } else if (JSON.stringify(permissionBody(existing)) !== JSON.stringify(permissionBody(row))) {
      await write(`Update permission ${permissionKey(row)}`, `/permissions/${existing.id}`, 'PATCH', permissionBody(row));
      changes++;
    }
  }

  for (const row of current) {
    if (!wantedKeys.has(permissionKey(row))) {
      await write(`Remove permission ${permissionKey(row)}`, `/permissions/${row.id}`, 'DELETE');
      changes++;
    }
  }

  console.log(`Permissions: ${changes} change(s).`);
}

async function addDefaultView() {
  const presets = await api('/presets?limit=-1&filter[collection][_eq]=authors&fields=id,bookmark,user,role');
  if (presets.some((p) => !p.bookmark && !p.user && !p.role)) {
    console.log('Authors default view: already exists.');
    return;
  }

  const { id, ...preset } = readTemplate('presets.json').find((p) => p.collection === 'authors');
  await write('Add Authors default view', '/presets', 'POST', preset);
}

async function verify() {
  if (DRY_RUN) return;

  const users = await request('/users?limit=1&fields=id', {}, { auth: false });
  const authors = await request('/items/authors?limit=1&fields=id,name', {}, { auth: false });

  console.log(`Anonymous /users: ${users.ok ? 'READABLE, check the Public policy' : `blocked (${users.status})`}`);
  console.log(`Anonymous /items/authors: ${authors.ok ? 'readable' : `blocked (${authors.status}), check the Public policy`}`);
  if (users.ok || !authors.ok) process.exitCode = 1;
}

async function main() {
  console.log(`Migrating ${DIRECTUS_URL} (${PROJECT}${LICENSED ? ', licensed' : ', core'})${DRY_RUN ? ' — dry run' : ''}\n`);
  await createAuthorsCollection();
  await migratePostAuthors();
  await reconcilePermissions();
  await addDefaultView();
  await verify();
  console.log(`\n${DRY_RUN ? 'Dry run done.' : 'Authors migration complete.'} Update your frontend to read author.name.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
