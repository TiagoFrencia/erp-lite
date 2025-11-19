/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // podés agregar más variables si las usás
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
