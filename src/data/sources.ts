/**
 * Where each kind of data comes from. Every area defaults to the local demo
 * data; switch one to the backend only after its endpoints exist and work.
 * Set in .env.local (see .env.example) and restart the dev server.
 */
export type DataSourceName = 'demo' | 'api'

const parse = (value: string | undefined): DataSourceName => (value === 'api' ? 'api' : 'demo')

export const dataSources = {
  /** Cases and their patients. API endpoints: cases.*, patients.update. */
  cases: parse(import.meta.env.VITE_CASES_SOURCE),
} as const
