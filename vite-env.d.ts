/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROXY_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
