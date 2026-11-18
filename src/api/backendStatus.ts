/**
 * Finds out which endpoints the backend really implements by reading its
 * OpenAPI document (`/openapi/v1.json`, mapped by ASP.NET Core in the
 * Development environment). Nothing here assumes an endpoint exists.
 */
import { apiRequest } from './http'
import { endpoints } from './endpoints'
import type { EndpointId, EndpointSpec } from './endpoints'

export const OPENAPI_PATH = '/openapi/v1.json'

interface OpenApiDocument {
  info?: { title?: string; version?: string }
  paths?: Record<string, Record<string, unknown>>
}

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const

/** "GET /api/Cases/{id}/" and "GET /api/cases/{caseId}" both become "GET /api/cases/{}". */
const operationKey = (method: string, path: string) =>
  `${method.toUpperCase()} ${path
    .toLowerCase()
    .replace(/\{[^}]+\}/g, '{}')
    .replace(/\/+$/, '')}`

export interface BackendOperation {
  method: string
  path: string
}

export interface BackendStatus {
  title: string
  version: string
  /** Every operation the backend documents. */
  operations: BackendOperation[]
  /** Catalogued endpoints the backend implements. */
  implemented: Set<EndpointId>
  /** Backend operations the frontend catalogue does not know about. */
  other: BackendOperation[]
  checkedAt: Date
}

export async function fetchBackendStatus(signal?: AbortSignal): Promise<BackendStatus> {
  const doc = await apiRequest<OpenApiDocument>('GET', OPENAPI_PATH, { signal })

  const operations: BackendOperation[] = []
  for (const [path, item] of Object.entries(doc.paths ?? {})) {
    for (const method of HTTP_METHODS) {
      if (item && method in item) operations.push({ method: method.toUpperCase(), path })
    }
  }

  const documented = new Set(operations.map((op) => operationKey(op.method, op.path)))
  const catalogue = Object.entries(endpoints) as [EndpointId, EndpointSpec][]
  const known = new Set(catalogue.map(([, spec]) => operationKey(spec.method, spec.path)))

  return {
    title: doc.info?.title ?? 'Backend API',
    version: doc.info?.version ?? '',
    operations,
    implemented: new Set(
      catalogue
        .filter(([, spec]) => documented.has(operationKey(spec.method, spec.path)))
        .map(([id]) => id),
    ),
    other: operations.filter((op) => !known.has(operationKey(op.method, op.path))),
    checkedAt: new Date(),
  }
}

let cached: Promise<BackendStatus> | null = null

/** Shared, cached status so the status bar and status page make one request. */
export function getBackendStatus({ refresh = false } = {}): Promise<BackendStatus> {
  if (!cached || refresh) {
    cached = fetchBackendStatus()
    cached.catch(() => {
      cached = null
    })
  }
  return cached
}
