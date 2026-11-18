/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Backend origin, e.g. "https://simcare-api.example.org". Leave unset in
   * development so requests go through the Vite proxy (vite.config.ts).
   */
  readonly VITE_API_BASE_URL?: string
  /** "api" loads cases and patients from the backend; anything else uses demo data. */
  readonly VITE_CASES_SOURCE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
