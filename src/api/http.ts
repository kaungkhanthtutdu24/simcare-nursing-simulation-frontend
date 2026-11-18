import type { ProblemDetails } from './contracts'

/**
 * Base URL for API calls. Leave VITE_API_BASE_URL unset in development so
 * requests stay same-origin and go through the Vite proxy (see vite.config.ts).
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const DEFAULT_TIMEOUT_MS = 10_000

export type ApiErrorKind =
  /** Could not reach the server at all. */
  | 'network'
  | 'timeout'
  /** The caller cancelled the request (e.g. the page was left). */
  | 'aborted'
  /** No such route on the backend yet (404/405 without a problem body, or 501). */
  | 'not-implemented'
  /** The route exists but the resource does not (404 with a problem body). */
  | 'not-found'
  | 'unauthorized'
  | 'forbidden'
  /** 409, e.g. editing a note that was already submitted. */
  | 'conflict'
  | 'validation'
  /** 5xx, including the Vite proxy's 500 when the backend is not running. */
  | 'server'
  /** The response was not the JSON we expected. */
  | 'invalid-response'
  | 'http'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number
  readonly problem?: ProblemDetails
  readonly method: string
  readonly path: string

  constructor(init: {
    kind: ApiErrorKind
    message: string
    method: string
    path: string
    status?: number
    problem?: ProblemDetails
    cause?: unknown
  }) {
    super(init.message, { cause: init.cause })
    this.name = 'ApiError'
    this.kind = init.kind
    this.status = init.status
    this.problem = init.problem
    this.method = init.method
    this.path = init.path
  }
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface RequestOptions {
  body?: unknown
  query?: Record<string, string | undefined>
  signal?: AbortSignal
  timeoutMs?: number
}

/** Supplies a bearer token once authentication exists. Returns null when signed out. */
type AccessTokenProvider = () => string | null | Promise<string | null>
let accessTokenProvider: AccessTokenProvider | null = null

/** Call once at start-up when real authentication is added. */
export function setAccessTokenProvider(provider: AccessTokenProvider | null) {
  accessTokenProvider = provider
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) params.set(key, value)
  }
  const search = params.toString()
  return `${API_BASE_URL}${path}${search ? `?${search}` : ''}`
}

function kindForStatus(status: number, problem: ProblemDetails | undefined): ApiErrorKind {
  if (status === 400 || status === 422) return 'validation'
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return problem ? 'not-found' : 'not-implemented'
  if (status === 405 || status === 501) return 'not-implemented'
  if (status === 409) return 'conflict'
  if (status >= 500) return 'server'
  return 'http'
}

async function readProblem(response: Response): Promise<ProblemDetails | undefined> {
  const type = response.headers.get('content-type') ?? ''
  if (!type.includes('json')) return undefined
  try {
    return (await response.json()) as ProblemDetails
  } catch {
    return undefined
  }
}

/**
 * Sends a JSON request and returns the parsed body. Throws ApiError on failure.
 * `path` starts with a slash, e.g. "/api/cases".
 */
export async function apiRequest<T>(
  method: HttpMethod,
  path: string,
  { body, query, signal, timeoutMs = DEFAULT_TIMEOUT_MS }: RequestOptions = {},
): Promise<T> {
  const timeout = AbortSignal.timeout(timeoutMs)
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = accessTokenProvider ? await accessTokenProvider() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: combined,
    })
  } catch (cause) {
    const kind: ApiErrorKind = signal?.aborted ? 'aborted' : timeout.aborted ? 'timeout' : 'network'
    const message =
      kind === 'timeout'
        ? `The server did not respond within ${timeoutMs / 1000} seconds.`
        : kind === 'aborted'
          ? 'The request was cancelled.'
          : 'Could not reach the server.'
    throw new ApiError({ kind, message, method, path, cause })
  }

  if (!response.ok) {
    const problem = await readProblem(response)
    const kind = kindForStatus(response.status, problem)
    const message =
      problem?.detail ??
      problem?.title ??
      (kind === 'not-implemented'
        ? `${method} ${path} is not available on the backend yet.`
        : `Request failed with HTTP ${response.status}.`)
    throw new ApiError({ kind, message, method, path, status: response.status, problem })
  }

  if (response.status === 204) return undefined as T
  try {
    return (await response.json()) as T
  } catch (cause) {
    throw new ApiError({
      kind: 'invalid-response',
      message: 'The server response was not valid JSON.',
      method,
      path,
      status: response.status,
      cause,
    })
  }
}

export const enc = encodeURIComponent
