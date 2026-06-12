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
	staticToken,
	uploadFiles,
	readMe,
	withToken,
	type QueryFilter,
	readUser,
} from '@directus/sdk';

const {
	public: { directusUrl },
	directusServerToken,
} = useRuntimeConfig();

// Server-side reads use DIRECTUS_SERVER_TOKEN (same as the Next.js starter) so licensed
// translation deep queries work.
let directusServer = createDirectus<Schema>(directusUrl as string, {
	globals: {
		fetch: $fetch,
	},
}).with(rest());

if (directusServerToken) {
	directusServer = directusServer.with(staticToken(directusServerToken as string));
}

export {
	directusServer,
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
