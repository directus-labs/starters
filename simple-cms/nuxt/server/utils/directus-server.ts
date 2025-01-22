import type { Schema } from '../../shared/types/directus-schema';
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
	readSingleton,
	createItem,
	updateItem,
	withToken,
	aggregate,
	uploadFiles,
};
