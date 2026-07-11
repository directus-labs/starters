import { $fetch } from 'ofetch';
import type { Schema } from '#shared/types/schema';
import {
	aggregate,
	createDirectus,
	readItem,
	readItems,
	rest,
	readSingleton,
	createItem,
	updateItem,
	uploadFiles,
	readMe,
	withToken,
	type QueryFilter,
	readUser,
} from '@directus/sdk';

const {
	public: { directusUrl },
} = useRuntimeConfig();

// Server reads default to Public permissions. Routes that need privileged reads
// should wrap individual requests with DIRECTUS_SERVER_TOKEN.
const directusServer = createDirectus<Schema>(directusUrl as string, {
	globals: {
		fetch: $fetch,
	},
}).with(rest());

function getDirectusServerToken() {
	const config = useRuntimeConfig();

	return ((config.directusServerToken as string | undefined) || '').trim() || null;
}

export {
	directusServer,
	getDirectusServerToken,
	readItem,
	readItems,
	readMe,
	readSingleton,
	createItem,
	updateItem,
	withToken,
	aggregate,
	uploadFiles,
	readUser,
};
export type { QueryFilter };
