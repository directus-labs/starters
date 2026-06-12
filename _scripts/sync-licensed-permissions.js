#!/usr/bin/env node
/**
 * Upgrade an existing core instance to licensed RBAC (Path 2).
 *
 * Run from the repo root (after LICENSE_KEY is active and core template/ is applied):
 *   pnpm rbac:sync-licensed
 *
 * 1. PATCHes permission rules from template-licensed (no content re-import)
 * 2. Removes circular redirects (url_from === url_to) that break frontends
 * 3. Patches the Redirect automation flow so unchanged slugs never create redirects
 *
 * Reads DIRECTUS URL from cms/directus/.env (PUBLIC_URL) and admin token from a
 * frontend .env (DIRECTUS_ADMIN_TOKEN or DIRECTUS_SERVER_TOKEN).
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const LICENSED_DIR = join(ROOT, 'cms/directus/template-licensed/src')
const LICENSED_PERMISSIONS = join(LICENSED_DIR, 'permissions.json')
const LICENSED_OPERATIONS = join(LICENSED_DIR, 'operations.json')

/** Redirect flow ops that must match template-licensed (skip unchanged slugs). */
const REDIRECT_FLOW_OP_IDS = [
	'b4e8c1f2-3a6d-4e5f-9b0c-1d2e3f4a5b6c', // URL Changed (condition) — create first
	'd7f64e04-ab43-4d77-b8e8-379b41af2d3a', // Format Payload (exec)
]

function loadEnvFile(path) {
	if (!existsSync(path)) return
	for (const line of readFileSync(path, 'utf8').split('\n')) {
		const trimmed = line.trim()
		if (!trimmed || trimmed.startsWith('#')) continue
		const eq = trimmed.indexOf('=')
		if (eq === -1) continue
		const key = trimmed.slice(0, eq).trim()
		let value = trimmed.slice(eq + 1).trim()
		const comment = value.indexOf(' #')
		if (comment !== -1) value = value.slice(0, comment).trim()
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1)
		}
		if (process.env[key] === undefined) process.env[key] = value
	}
}

loadEnvFile(join(ROOT, 'cms/directus/.env'))
for (const frontend of ['nextjs', 'nuxt', 'astro', 'sveltekit']) {
	loadEnvFile(join(ROOT, 'cms', frontend, '.env'))
}

const DIRECTUS_URL = (
	process.env.DIRECTUS_URL ||
	process.env.PUBLIC_URL ||
	process.env.NEXT_PUBLIC_DIRECTUS_URL ||
	'http://localhost:8055'
).replace(/\/$/, '')
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN || process.env.DIRECTUS_SERVER_TOKEN

if (!TOKEN) {
	console.error('Missing admin token.')
	console.error('Add DIRECTUS_ADMIN_TOKEN to a frontend .env (e.g. cms/nextjs/.env), or run:')
	console.error('  DIRECTUS_ADMIN_TOKEN=your-token pnpm rbac:sync-licensed')
	process.exit(1)
}

if (!existsSync(LICENSED_PERMISSIONS)) {
	console.error(`Licensed permissions file not found: ${LICENSED_PERMISSIONS}`)
	console.error('Run: pnpm rbac:codegen')
	process.exit(1)
}

const licensedRows = JSON.parse(readFileSync(LICENSED_PERMISSIONS, 'utf8'))

function permKey(row) {
	return `${row.collection}:${row.action}:${row.policy}`
}

function hasCustomRules(row) {
	const p = row.permissions
	const v = row.validation
	const presets = row.presets
	const fields = row.fields
	return (
		(p !== null && p !== undefined && JSON.stringify(p) !== '{}') ||
		(v !== null && v !== undefined && JSON.stringify(v) !== '{}' && JSON.stringify(v) !== 'null') ||
		presets !== null ||
		(Array.isArray(fields) && fields.length > 0 && !(fields.length === 1 && fields[0] === '*'))
	)
}

async function api(path, options = {}) {
	const res = await fetch(`${DIRECTUS_URL}${path}`, {
		...options,
		headers: {
			Authorization: `Bearer ${TOKEN}`,
			'Content-Type': 'application/json',
			...options.headers,
		},
	})
	const body = await res.json().catch(() => ({}))
	if (!res.ok) {
		const msg = body?.errors?.[0]?.message || body?.message || res.statusText
		throw new Error(`${options.method || 'GET'} ${path} failed (${res.status}): ${msg}`)
	}
	return body
}

async function apiStatus(path, options = {}) {
	const res = await fetch(`${DIRECTUS_URL}${path}`, {
		...options,
		headers: {
			Authorization: `Bearer ${TOKEN}`,
			'Content-Type': 'application/json',
			...options.headers,
		},
	})
	const body = await res.json().catch(() => ({}))
	return { ok: res.ok, status: res.status, body }
}

function isCircularRedirect(urlFrom, urlTo) {
	if (!urlFrom || !urlTo) return false
	const normalize = (path) => (path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path)
	return normalize(urlFrom) === normalize(urlTo)
}

async function removeCircularRedirects() {
	const res = await api('/items/redirects?limit=-1&fields=id,url_from,url_to')
	const items = res.data ?? []
	const circular = items.filter((row) => isCircularRedirect(row.url_from, row.url_to))

	if (circular.length === 0) {
		console.log('Circular redirects: none found.')
		return 0
	}

	await api('/items/redirects', {
		method: 'DELETE',
		body: JSON.stringify(circular.map((row) => row.id)),
	})

	console.log(`Circular redirects: removed ${circular.length}.`)
	return circular.length
}

function operationPayload(template) {
	return {
		id: template.id,
		name: template.name,
		key: template.key,
		type: template.type,
		position_x: template.position_x,
		position_y: template.position_y,
		options: template.options,
		resolve: template.resolve,
		reject: template.reject,
		flow: template.flow,
	}
}

async function syncRedirectFlowOperations() {
	if (!existsSync(LICENSED_OPERATIONS)) {
		console.warn('operations.json not found — skipped redirect flow patch.')
		return
	}

	const templateOps = JSON.parse(readFileSync(LICENSED_OPERATIONS, 'utf8'))
	const byId = new Map(templateOps.map((op) => [op.id, op]))
	let patched = 0
	let created = 0

	for (const id of REDIRECT_FLOW_OP_IDS) {
		const template = byId.get(id)
		if (!template) {
			console.warn(`Redirect flow operation ${id} missing from template — skipped.`)
			continue
		}

		const { ok } = await apiStatus(`/operations/${id}`)

		if (ok) {
			await api(`/operations/${id}`, {
				method: 'PATCH',
				body: JSON.stringify({
					options: template.options,
					resolve: template.resolve,
					reject: template.reject,
				}),
			})
			patched++
		} else {
			await api('/operations', {
				method: 'POST',
				body: JSON.stringify(operationPayload(template)),
			})
			created++
		}
	}

	console.log(`Redirect automation flow: ${patched} patched, ${created} created.`)
}

async function main() {
	const existing = await api('/permissions?limit=-1&fields=id,collection,action,policy')
	const rows = existing.data ?? existing
	const byKey = new Map(rows.map((row) => [permKey(row), row]))

	let updated = 0
	let skipped = 0
	let missing = 0
	let customAfter = 0

	for (const licensed of licensedRows) {
		const key = permKey(licensed)
		const current = byKey.get(key)
		if (!current) {
			missing++
			console.warn(`No existing permission for ${key} — skipped (apply template first)`)
			continue
		}

		const payload = {
			permissions: licensed.permissions,
			validation: licensed.validation,
			presets: licensed.presets,
			fields: licensed.fields,
		}

		await api(`/permissions/${current.id}`, {
			method: 'PATCH',
			body: JSON.stringify(payload),
		})

		updated++
		if (hasCustomRules(licensed)) customAfter++
	}

	// Verify public pages read filter landed
	const pagesPublic = licensedRows.find(
		(r) => r.collection === 'pages' && r.action === 'read' && r.policy === 'abf8a154-5b1c-4a46-ac9c-7300570f4f17',
	)
	const pagesPublicDb = byKey.get(permKey(pagesPublic))
	let verify = 'not checked'
	if (pagesPublicDb) {
		const check = await api(`/permissions/${pagesPublicDb.id}?fields=permissions`)
		const perms = check.data?.permissions ?? check.permissions
		verify = perms?._and ? 'licensed filters present' : 'still flat — check LICENSE_KEY is active'
	}

	console.log(`Synced ${updated} permission rows (${customAfter} with custom rules).`)
	if (missing) console.log(`${missing} licensed rows had no matching DB row.`)
	console.log(`Public pages read: ${verify}`)

	await removeCircularRedirects()
	await syncRedirectFlowOperations()
	console.log('Licensed upgrade complete. Restart frontend dev servers so redirects reload.')
}

main().catch((err) => {
	console.error(err.message)
	process.exit(1)
})
