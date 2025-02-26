import type { Schema } from '../../shared/types/schema';
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

const directusServer = createDirectus<Schema>(directusUrl as string)
	.with(rest())
	.with(staticToken(directusServerToken as string));

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
