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

// Helper for retrying fetch requests
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const fetchRetry = async (fetch: Function, count: number, ...args: any[]) => {
	const response = await fetch(...args);

	if (count > 2 || response.status !== 429) return response;

	console.warn(`[429] Too Many Requests (Attempt ${count + 1})`);

	await sleep(500);

	return fetchRetry(fetch, count + 1, ...args);
};

// Queue for rate-limited requests
const queue = new Queue({ intervalCap: 10, interval: 500, carryoverConcurrencyCount: true });

const directusUrl = PUBLIC_DIRECTUS_URL;

const getDirectus = (fetch: Function) => {

	const directus = createDirectus<Schema>(directusUrl, {
		globals: {
			fetch: (...args) => queue.add(() => fetchRetry(fetch, 0, ...args))
		}
	}).with(rest());

	return directus;
};

export const useDirectus = () => ({
	// directus: directus as RestClient<Schema>,
	getDirectus: getDirectus as (fetch: Function) => RestClient<Schema>,
	readItems,
	readItem,
	readSingleton,
	readUser,
	createItem,
	uploadFiles,
	withToken
});
