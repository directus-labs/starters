/**
 * Creates stub directories for @resvg/resvg-js optional native bindings that
 * may not be installed on the current platform (e.g. linux-x64-musl on Vercel).
 * Nitro's Rollup calls realpath() on these paths during build; if they don't
 * exist, the build fails with ENOENT. Creating the dirs allows realpath to succeed.
 */
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const pnpmDir = join(root, 'node_modules/.pnpm');

const optionalBindings = [
	'resvg-js-linux-x64-musl',
	'resvg-js-linux-arm64-musl',
];

// Find main @resvg+resvg-js@X.Y.Z package in .pnpm (version-agnostic)
if (!existsSync(pnpmDir)) {
	process.exit(0);
}

const entries = readdirSync(pnpmDir, { withFileTypes: true });
const mainResvg = entries.find((d) => d.isDirectory() && /^@resvg\+resvg-js@\d+\.\d+\.\d+$/.test(d.name));
if (!mainResvg) {
	process.exit(0);
}

const base = join(pnpmDir, mainResvg.name, 'node_modules/@resvg');
if (!existsSync(base)) {
	mkdirSync(base, { recursive: true });
}

for (const name of optionalBindings) {
	const dir = join(base, name);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
		console.log('[ensure-resvg-dirs] Created stub:', relative(root, dir));
	}
}
