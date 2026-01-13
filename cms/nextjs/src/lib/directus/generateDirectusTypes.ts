import { config } from 'dotenv';
import { generateDirectusTypes } from 'directus-sdk-typegen';
import * as readline from 'readline';

config();

function promptForToken(): Promise<string> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		rl.question(
			'Enter your Directus admin token (with permissions to read system collections like directus_fields): ',
			(answer) => {
				rl.close();
				resolve(answer.trim());
			}
		);
	});
}

async function generateTypes() {
	const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;

	if (!directusUrl) {
		console.error('Error: NEXT_PUBLIC_DIRECTUS_URL is missing in the .env file.');
		process.exit(1);
	}

	// Allow token to be provided via environment variable for testing/CI, otherwise prompt
	const directusToken = process.env.DIRECTUS_ADMIN_TOKEN || await promptForToken();

	if (!directusToken) {
		console.error('Error: Admin token is required to generate types.');
		process.exit(1);
	}

	try {
		await generateDirectusTypes({
			outputPath: './src/types/directus-schema.ts',
			directusUrl,
			directusToken,
		});
		console.log('Types successfully generated!');
	} catch (error) {
		console.error('Failed to generate types:', error);
		process.exit(1);
	}
}

generateTypes();
