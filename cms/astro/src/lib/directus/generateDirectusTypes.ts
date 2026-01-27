/* eslint-disable no-console */
import { config } from "dotenv";
import { generateDirectusTypes } from "directus-sdk-typegen";
import readlineSync from "readline-sync";

config();

function promptForToken(): Promise<string> {
  if (!process.stdin.isTTY) {
    console.error(
      "Cannot prompt for token: not a TTY. Set DIRECTUS_ADMIN_TOKEN env var instead."
    );

    process.exit(1);
  }

  const answer = readlineSync.question(
    "Enter your Directus admin token (with permissions to read system collections like directus_fields): ",
    { hideEchoBack: true }
  );

  return Promise.resolve(answer.trim());
}

async function generateTypes() {
  const directusUrl = process.env.PUBLIC_DIRECTUS_URL;

  if (!directusUrl) {
    console.error("Error: PUBLIC_DIRECTUS_URL is missing in the .env file.");
    process.exit(1);
  }

  // Allow token to be provided via environment variable for testing/CI, otherwise prompt
  const directusToken = process.env.DIRECTUS_ADMIN_TOKEN || await promptForToken();

  if (!directusToken) {
    console.error("Error: Admin token is required to generate types.");
    process.exit(1);
  }

  try {
    await generateDirectusTypes({
      outputPath: "./src/types/directus-schema.ts",
      directusUrl,
      directusToken,
    });

    console.log("Types successfully generated!");
  } catch (error) {
    console.error("Failed to generate types:", error);
    process.exit(1);
  }
}

generateTypes();
