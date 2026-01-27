import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { generateDirectusTypes } from 'directus-sdk-typegen';
import dotenv from 'dotenv';
import readlineSync from 'readline-sync';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '../../'); // Go up two levels to project root

function promptForToken() {
	if (!process.stdin.isTTY) {
		console.error(
			'Cannot prompt for token: not a TTY. Set DIRECTUS_ADMIN_TOKEN or DIRECTUS_SERVER_TOKEN env var instead.'
		);
		process.exit(1);
	}
	const answer = readlineSync.question(
		'Enter your Directus admin token (with permissions to read system collections like directus_fields): ',
		{ hideEchoBack: true }
	);
	return answer.trim();
}

async function generateTypes() {
	const directusUrl = process.env.DIRECTUS_URL;

	if (!directusUrl) {
		console.error('Error: DIRECTUS_URL is missing in the .env file.');
		process.exit(1);
	}

	// Allow token via env (DIRECTUS_ADMIN_TOKEN or DIRECTUS_SERVER_TOKEN) for testing/CI, otherwise prompt
	const directusToken =
		process.env.DIRECTUS_ADMIN_TOKEN ||
		process.env.DIRECTUS_SERVER_TOKEN ||
		promptForToken();

	if (!directusToken) {
		console.error('Error: Admin token is required to generate types.');
		process.exit(1);
	}

	try {
		const outputPath = join(projectRoot, 'nuxt', 'shared', 'types', 'schema.ts');

		// Log the path to help debug in case of errors
		console.log('Attempting to write to:', outputPath);

		await generateDirectusTypes({
			outputPath,
			directusUrl,
			directusToken,
		});
		console.log('Types successfully generated!');
	} catch (error) {
		console.error('Failed to generate types:', error);
		console.error('Current directory:', __dirname);
		console.error('Project root:', projectRoot);
		process.exit(1);
	}
}

generateTypes();
