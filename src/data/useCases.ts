/**
 * Cases and patients, from either the local demo data or the backend API.
 * The source is chosen once, by VITE_CASES_SOURCE (see ./sources.ts).
 */
import { useCallback, useMemo, useState } from 'react'
import type { PatientCase, Role } from '../model'
import { casesApi, patientsApi } from '../api/clinical'
import type { CaseDto } from '../api/contracts'
import type { ApiError } from '../api/http'
import { toPatientCase, toUpdateCaseRequest, toUpdatePatientRequest } from '../api/mappers'
import { useApiResource } from '../api/useApiResource'
import { dataSources } from './sources'
import type { DataSourceName } from './sources'

export interface CasesController {
  source: DataSourceName
  status: 'loading' | 'ready' | 'error'
  error: ApiError | null
  /** The case shown in the banner and screens; null while loading or if there are none. */
  current: PatientCase | null
  /** Case keys the user can open (used to validate :caseId in URLs). */
  caseKeys: string[]
  /** True when the current case has edits that are not saved yet (API only). */
  dirty: boolean
  reload: () => void
  /** Change fields of the current case locally. */
  edit: (patch: Partial<PatientCase>) => void
  /** Save local edits. Rejects with ApiError on failure. */
  save: () => Promise<void>
  /** Publish or move to draft (saving any edits first). Rejects with ApiError on failure. */
  setPublished: (published: boolean) => Promise<void>
}

export interface UseCasesInput {
  role: Role
  /** :caseId from the URL, if any. */
  caseId: string | undefined
  /** Demo source only: the demo case and how to change it. */
  demoCase: PatientCase
  updateDemoCase: (patch: Partial<PatientCase>) => void
}

/** Demo source: the single case kept in browser storage, exactly as before. */
function useDemoCases({ demoCase, updateDemoCase }: UseCasesInput): CasesController {
  return useMemo(
    () => ({
      source: 'demo',
      status: 'ready',
      error: null,
      current: demoCase,
      caseKeys: [demoCase.caseKey],
      dirty: false,
      reload: () => {},
      edit: updateDemoCase,
      save: async () => {},
      setPublished: async (published) => updateDemoCase({ published }),
    }),
    [demoCase, updateDemoCase],
  )
}

/** API source: GET /api/cases, GET /api/cases/{id}, PUT patient + case, publish/unpublish. */
function useApiCases({ role, caseId }: UseCasesInput): CasesController {
  const list = useApiResource('cases', ({ signal }) => casesApi.list({ signal }))

  // Candidates should only receive published cases; filter again to be safe.
  const visible = useMemo(() => {
    if (list.status !== 'success') return []
    return role === 'candidate' ? list.data.filter((c) => c.status === 'published') : list.data
  }, [list, role])
  const caseKeys = useMemo(() => visible.map((c) => c.id), [visible])
  const selectedId = caseId && caseKeys.includes(caseId) ? caseId : caseKeys[0]

  const detail = useApiResource(`case:${selectedId ?? ''}`, ({ signal }) =>
    selectedId ? casesApi.get(selectedId, { signal }) : Promise.resolve(null),
  )

  // Latest copy returned by a save or publish, and unsaved local edits.
  const [saved, setSaved] = useState<CaseDto | null>(null)
  const [edits, setEdits] = useState<{ caseId: string; patch: Partial<PatientCase> } | null>(null)

  const server: CaseDto | null =
    saved && saved.id === selectedId ? saved : detail.status === 'success' ? detail.data : null
  const patch = edits && edits.caseId === selectedId ? edits.patch : null
  const current = server ? { ...toPatientCase(server), ...patch } : null
  const dirty = patch !== null && Object.keys(patch).length > 0

  const edit = useCallback(
    (change: Partial<PatientCase>) => {
      if (!selectedId) return
      setEdits((prev) => ({
        caseId: selectedId,
        patch: { ...(prev?.caseId === selectedId ? prev.patch : {}), ...change },
      }))
    },
    [selectedId],
  )

  const save = async () => {
    if (!server || !current || !dirty) return
    await patientsApi.update(server.patient.id, toUpdatePatientRequest(current))
    const updated = await casesApi.update(
      server.id,
      toUpdateCaseRequest(current, server.patient.id),
    )
    setSaved(updated)
    setEdits(null)
  }

  const setPublished = async (published: boolean) => {
    if (!server) return
    await save()
    setSaved(published ? await casesApi.publish(server.id) : await casesApi.unpublish(server.id))
  }

  const reload = () => {
    setSaved(null)
    list.reload()
    detail.reload()
  }

  const error =
    list.status === 'error' ? list.error : detail.status === 'error' ? detail.error : null
  const status: CasesController['status'] = error
    ? 'error'
    : list.status === 'loading' || (selectedId && !server)
      ? 'loading'
      : 'ready'

  return {
    source: 'api',
    status,
    error,
    current,
    caseKeys,
    dirty,
    reload,
    edit,
    save,
    setPublished,
  }
}

/** Use the configured source. Chosen once at start-up, so hook order never changes. */
export const useCases = dataSources.cases === 'api' ? useApiCases : useDemoCases
