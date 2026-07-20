#!/usr/bin/env node

/**
 * Validates all starter templates have the required structure and metadata
 * for compatibility with directus-template-cli.
 *
 * Usage: node _scripts/validate-templates.js
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { execSync } from 'node:child_process'

const ROOT = resolve(import.meta.dirname, '..')
const SKIP_DIRS = ['_shared', '_scripts', 'node_modules', '.git', '.github']

let errors = []
let warnings = []

function error(template, msg) {
  errors.push(`[${template}] ${msg}`)
}

function warn(template, msg) {
  warnings.push(`[${template}] ${msg}`)
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch {
    return null
  }
}

// Find all template directories (top-level dirs with a package.json containing directus:template)
function discoverTemplates() {
  const templates = []
  for (const entry of readdirSync(ROOT)) {
    if (SKIP_DIRS.includes(entry) || entry.startsWith('.')) continue
    const dirPath = join(ROOT, entry)
    if (!statSync(dirPath).isDirectory()) continue

    const pkgPath = join(dirPath, 'package.json')
    if (!existsSync(pkgPath)) continue

    const pkg = readJson(pkgPath)
    if (!pkg || !pkg['directus:template']) continue

    templates.push({ name: entry, path: dirPath, pkg })
  }
  return templates
}

// Validate template metadata
function validateMetadata(template) {
  const config = template.pkg['directus:template']

  if (!config.name) {
    error(template.name, 'directus:template.name is missing')
  }
  if (!config.description) {
    error(template.name, 'directus:template.description is missing')
  }
  if (config.template === undefined) {
    error(template.name, 'directus:template.template is missing (use null for blank templates)')
  }
}

// Validate a single Directus template directory
function validateTemplateDir(templateName, basePath, templateRelPath, label) {
  const templatePath = join(basePath, templateRelPath.replace(/^\.\//, ''))
  const srcPath = join(templatePath, 'src')

  if (!existsSync(templatePath)) {
    error(templateName, `Template path does not exist: ${label}`)
    return
  }

  const requiredFiles = ['collections.json', 'fields.json']
  for (const file of requiredFiles) {
    if (!existsSync(join(srcPath, file))) {
      error(templateName, `Missing required file: ${label}/src/${file}`)
    }
  }

  if (!existsSync(join(templatePath, 'package.json'))) {
    warn(templateName, `Missing package.json in template: ${label}`)
  }

  validateSingletonContent(templateName, srcPath)
}

// Validate Directus template files
function validateDirectusTemplate(template) {
  const config = template.pkg['directus:template']

  // Blank templates (template: null) don't need directus files
  if (config.template === null) return

  validateTemplateDir(template.name, template.path, config.template, config.template)

  // Validate variant template paths
  if (config.variants) {
    for (const [variantKey, variant] of Object.entries(config.variants)) {
      if (variant.template) {
        validateTemplateDir(template.name, template.path, variant.template, `${variant.template} (variant: ${variantKey})`)
      }
    }
  }
}

// Singleton collections load after regular collections in directus-template-cli.
// Translation rows for a singleton must be nested in its content file, not a separate *_translations.json.
function validateSingletonContent(templateName, srcPath) {
  const contentDir = join(srcPath, 'content')
  if (!existsSync(contentDir)) return

  const collections = readJson(join(srcPath, 'collections.json'))
  if (!collections) return

  const contentFiles = new Set(
    readdirSync(contentDir)
      .filter((file) => file.endsWith('.json'))
      .map((file) => file.replace(/\.json$/, '')),
  )

  for (const { collection, meta } of collections) {
    if (!meta?.singleton) continue
    const translationsFile = `${collection}_translations`
    if (contentFiles.has(translationsFile)) {
      error(
        templateName,
        `content/${translationsFile}.json must not exist — nest translations inside content/${collection}.json (template-cli loads singletons last)`,
      )
    }
  }
}

// Validate Docker scaffolding
function validateDocker(template) {
  const config = template.pkg['directus:template']
  if (config.template === null) return

  const directusDir = join(template.path, 'directus')

  const requiredFiles = ['docker-compose.yaml', '.env.example']
  for (const file of requiredFiles) {
    if (!existsSync(join(directusDir, file))) {
      error(template.name, `Missing ${file} in directus/`)
    }
  }
}

// Validate frontend directories
function validateFrontends(template) {
  const config = template.pkg['directus:template']
  const frontends = config.frontends || {}

  for (const [id, frontend] of Object.entries(frontends)) {
    const frontendPath = join(template.path, frontend.path.replace(/^\.\//, ''))

    if (!existsSync(frontendPath)) {
      error(template.name, `Frontend "${id}" path does not exist: ${frontend.path}`)
      continue
    }

    const frontendPkg = join(frontendPath, 'package.json')
    if (!existsSync(frontendPkg)) {
      error(template.name, `Frontend "${id}" is missing package.json`)
      continue
    }

    // Check for .env.example
    if (!existsSync(join(frontendPath, '.env.example'))) {
      warn(template.name, `Frontend "${id}" is missing .env.example`)
    }
  }
}

// Validate all docker-compose files use the same Directus version
function validateDirectusVersion(templates) {
  const versions = new Map()

  for (const template of templates) {
    const composePath = join(template.path, 'directus', 'docker-compose.yaml')
    if (!existsSync(composePath)) continue

    const content = readFileSync(composePath, 'utf8')
    const match = content.match(/directus\/directus:([^\s'"]+)/)
    if (match) {
      versions.set(template.name, match[1])
    }
  }

  const uniqueVersions = new Set(versions.values())
  if (uniqueVersions.size > 1) {
    const details = [...versions.entries()]
      .map(([name, ver]) => `  ${name}: ${ver}`)
      .join('\n')
    error('*', `Directus version mismatch across templates:\n${details}`)
  }
}

// Validate docker/env files match canonical _shared versions
function validateSharedFiles(templates) {
  const sharedDir = join(ROOT, '_shared')
  if (!existsSync(sharedDir)) return

  const sharedFiles = ['docker-compose.yaml', '.env.example']

  for (const file of sharedFiles) {
    const canonicalPath = join(sharedDir, file)
    if (!existsSync(canonicalPath)) continue

    const canonical = readFileSync(canonicalPath, 'utf8')

    for (const template of templates) {
      const config = template.pkg['directus:template']
      if (config.template === null) continue

      const templateFile = join(template.path, 'directus', file)
      if (!existsSync(templateFile)) continue

      // For docker-compose, ignore the `name:` line (it differs per template)
      let templateContent = readFileSync(templateFile, 'utf8')
      let canonicalContent = canonical

      if (file === 'docker-compose.yaml') {
        templateContent = templateContent.replace(/^name:.*$/m, '')
        canonicalContent = canonicalContent.replace(/^name:.*$/m, '')
      }

      if (templateContent.trim() !== canonicalContent.trim()) {
        warn(template.name, `directus/${file} differs from _shared/${file}`)
      }
    }
  }
}

// Run
console.log('Validating templates...\n')

const templates = discoverTemplates()

if (templates.length === 0) {
  console.error('No templates found!')
  process.exit(1)
}

console.log(`Found ${templates.length} templates: ${templates.map((t) => t.name).join(', ')}\n`)

for (const template of templates) {
  validateMetadata(template)
  validateDirectusTemplate(template)
  validateDocker(template)
  validateFrontends(template)
}

validateDirectusVersion(templates)
validateSharedFiles(templates)

// Report
if (warnings.length > 0) {
  console.log('Warnings:')
  for (const w of warnings) console.log(`  ⚠ ${w}`)
  console.log()
}

if (errors.length > 0) {
  console.log('Errors:')
  for (const e of errors) console.log(`  ✗ ${e}`)
  console.log(`\n${errors.length} error(s) found.`)
  process.exit(1)
}

console.log('All templates valid.')
