import {
	createDirectus,
	readItems,
	readItem,
	readSingleton,
	rest,
	readUser,
	createItem,
	uploadFiles,
	withToken
} from '@directus/sdk';
import type { RestClient } from '@directus/sdk';
import Queue from 'p-queue';
import type { Schema } from '../types/directus-schema';
import { PUBLIC_DIRECTUS_URL } from '$env/static/public';
import { getRequestEvent } from '$app/server';
import { browser } from '$app/environment';


// Helper for retrying fetch requests
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const fetchRetry = async (sveltekitFetch: typeof fetch, count: number, ...args: any[]) => {
	const response = await sveltekitFetch(...args as Parameters<typeof fetch>);

	if (count > 2 || response.status !== 429) return response;

	console.warn(`[429] Too Many Requests (Attempt ${count + 1})`);

	await sleep(500);

	return fetchRetry(fetch, count + 1, ...args);
};

// Queue for rate-limited requests
const queue = new Queue({ intervalCap: 10, interval: 500, carryoverConcurrencyCount: true });

const directusUrl = PUBLIC_DIRECTUS_URL;

const getDirectus = () => {

	let fetch = globalThis.fetch;
	if (!browser) {
		// server side, so using sveltekit optimized fetch
		// https://svelte.dev/docs/kit/load#Making-fetch-requests
		// https://svelte.dev/docs/kit/$app-server#getRequestEvent
		const { fetch: sveltekitFetch } = getRequestEvent();
		fetch = sveltekitFetch;
	} else {
		// client side, so sticking with default fetch
	}

	const directus = createDirectus<Schema>(directusUrl, {
		globals: {
			fetch: (...args) => queue.add(() => fetchRetry(fetch, 0, ...args))
		}
	}).with(rest());

	return directus;
};

export const useDirectus = () => ({
	// directus: directus as RestClient<Schema>,
	getDirectus: getDirectus as () => RestClient<Schema>,
	readItems,
	readItem,
	readSingleton,
	readUser,
	createItem,
	uploadFiles,
	withToken
});
