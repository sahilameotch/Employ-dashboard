/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_DUMMY_API?: string
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
