#!/usr/bin/env node

/**
 * Auto-generates .release-please-config.json and .release-please-manifest.json
 * by scanning for template directories with directus:template in package.json.
 *
 * Preserves existing versions in the manifest. New templates start at 0.0.0.
 *
 * Usage: node _scripts/sync-release-config.js
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const SKIP_DIRS = ['_shared', '_scripts', 'node_modules', '.git', '.github']

const CONFIG_PATH = join(ROOT, '.release-please-config.json')
const MANIFEST_PATH = join(ROOT, '.release-please-manifest.json')

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch {
    return null
  }
}

// Discover template directories
const templates = []
for (const entry of readdirSync(ROOT)) {
  if (SKIP_DIRS.includes(entry) || entry.startsWith('.')) continue
  const dirPath = join(ROOT, entry)
  if (!statSync(dirPath).isDirectory()) continue

  const pkg = readJson(join(dirPath, 'package.json'))
  if (!pkg || !pkg['directus:template']) continue

  templates.push(entry)
}

templates.sort()

// Read existing manifest to preserve versions
const existingManifest = readJson(MANIFEST_PATH) || {}

// Generate config
const config = {
  $schema: 'https://raw.githubusercontent.com/googleapis/release-please/main/schemas/config.json',
  packages: {},
}

const manifest = {}

for (const name of templates) {
  config.packages[name] = {
    'release-type': 'node',
    component: name,
    'changelog-path': 'CHANGELOG.md',
  }

  // Preserve existing version or default to 0.0.0
  manifest[name] = existingManifest[name] || '0.0.0'
}

// Write files
const configJson = JSON.stringify(config, null, 2) + '\n'
const manifestJson = JSON.stringify(manifest, null, 2) + '\n'

const existingConfig = existsSync(CONFIG_PATH) ? readFileSync(CONFIG_PATH, 'utf8') : ''
const existingManifestStr = existsSync(MANIFEST_PATH) ? readFileSync(MANIFEST_PATH, 'utf8') : ''

let changed = false

if (configJson !== existingConfig) {
  writeFileSync(CONFIG_PATH, configJson)
  console.log('Updated .release-please-config.json')
  changed = true
}

if (manifestJson !== existingManifestStr) {
  writeFileSync(MANIFEST_PATH, manifestJson)
  console.log('Updated .release-please-manifest.json')
  changed = true
}

if (!changed) {
  console.log('Release config is up to date.')
}
