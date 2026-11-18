import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from './http'

export type Resource<T> =
  { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: ApiError }

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  return new ApiError({
    kind: 'http',
    message: error instanceof Error ? error.message : 'Unexpected error.',
    method: 'GET',
    path: '',
    cause: error,
  })
}

/**
 * Loads data and tracks loading, success and error states.
 *
 * `key` identifies what is being loaded (e.g. a case ID); changing it reloads.
 * The request is cancelled if the component unmounts or the key changes.
 * `reload()` loads again and tells the loader to bypass any cache.
 */
export function useApiResource<T>(
  key: string,
  load: (options: { signal: AbortSignal; refresh: boolean }) => Promise<T>,
): Resource<T> & { reload: () => void } {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<{ request: string; result: Resource<T> } | null>(null)
  const loadRef = useRef(load)
  const request = `${key}#${attempt}`

  useEffect(() => {
    loadRef.current = load
  })

  useEffect(() => {
    const controller = new AbortController()
    const settle = (result: Resource<T>) => {
      if (!controller.signal.aborted) setSettled({ request, result })
    }
    loadRef.current({ signal: controller.signal, refresh: attempt > 0 }).then(
      (data) => settle({ status: 'success', data }),
      (error: unknown) => settle({ status: 'error', error: toApiError(error) }),
    )
    return () => controller.abort()
  }, [request, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])
  // Loading until the current request (key + attempt) has settled.
  const state: Resource<T> = settled?.request === request ? settled.result : { status: 'loading' }
  return { ...state, reload }
}
