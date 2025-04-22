/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_DIRECTUS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
