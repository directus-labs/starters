import { $fetch } from 'ofetch';
import type { Schema } from '#shared/types/schema';
import {
	createDirectus,
	readItem,
	readItems,
	rest,
	readSingleton,
	createItem,
	// staticToken,
	uploadFiles,
	withToken,
	type QueryFilter,
} from '@directus/sdk';
export { aggregate, updateItem, readMe, readUser } from '@directus/sdk';

const {
	public: { directusUrl },
	// directusServerToken,
} = useRuntimeConfig();

// By default, we use the Public permissions to fetch content (even on the server side). If you want to restrict public access it's recommended to use the staticToken option.
const directusServer = createDirectus<Schema>(directusUrl as string, {
	globals: {
		fetch: $fetch,
	},
}).with(rest());
// .with(staticToken(directusServerToken as string));

export {
	directusServer,
	readItem,
	readItems,
	readSingleton,
	createItem,
	withToken,
	uploadFiles,
};
export type { QueryFilter };
