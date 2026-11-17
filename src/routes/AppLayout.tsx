import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useMatches, useNavigate } from 'react-router'
import { candidateIds, candidateNames, loadDemoState, saveDemoState } from '../model'
import type {
  CandidateId,
  CandidateWork,
  DemoState,
  PatientCase,
  Role,
  ScenarioEvent,
  View,
} from '../model'
import { useSession } from '../auth/session'
import { PatientBanner } from '../components/PatientBanner'
import { Ribbon } from '../components/Ribbon'
import { RightPanel } from '../components/RightPanel'
import { Sidebar } from '../components/Sidebar'
import { StatusBar } from '../components/StatusBar'
import { TitleBar } from '../components/TitleBar'
import { AppContext } from './appContext'
import type { AppContextValue } from './appContext'
import { roleHome, routeParamsExist, viewPath } from './paths'

const NOTICE_DURATION_MS = 3200

/** Route metadata: which sidebar item a route belongs to. */
export interface RouteHandle {
  view: View
}

/** Clears a candidate's inbox progress when a new event is released. */
const resetInbox = (work: CandidateWork): CandidateWork => ({
  ...work,
  inboxOpened: false,
  response: '',
  responseSubmitted: false,
})

/** The application shell. Every route renders inside its main panel. */
export function AppLayout() {
  const session = useSession()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const matches = useMatches()

  const [demo, setDemo] = useState<DemoState>(loadDemoState)
  const [reviewCandidate, setReviewCandidate] = useState<CandidateId>('candidate-01')
  const [notice, setNotice] = useState('')

  const role: Role = pathname.startsWith('/educator') ? 'educator' : 'candidate'
  const candidateId = session.candidateId
  // Highlight the sidebar item for the current route, unless the URL has an
  // unknown case/patient/candidate ID (the page then shows "not found").
  const lastMatch = matches.at(-1)
  const currentView =
    lastMatch && routeParamsExist(lastMatch.params, demo.patient)
      ? (lastMatch.handle as RouteHandle | undefined)?.view
      : undefined

  useEffect(() => {
    saveDemoState(demo)
  }, [demo])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), NOTICE_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [notice])

  const updatePatient = useCallback(
    (patch: Partial<PatientCase>) =>
      setDemo((prev) => ({ ...prev, patient: { ...prev.patient, ...patch } })),
    [],
  )

  const updateEvent = useCallback(
    (patch: Partial<ScenarioEvent>) =>
      setDemo((prev) => {
        const event = { ...prev.event, ...patch }
        const releasedNow = patch.released === true && !prev.event.released
        if (!releasedNow) return { ...prev, event }
        const candidates = { ...prev.candidates }
        for (const id of candidateIds) candidates[id] = resetInbox(prev.candidates[id])
        return { ...prev, event, candidates }
      }),
    [],
  )

  const updateCandidate = useCallback(
    (id: CandidateId, patch: Partial<CandidateWork>) =>
      setDemo((prev) => ({
        ...prev,
        candidates: { ...prev.candidates, [id]: { ...prev.candidates[id], ...patch } },
      })),
    [],
  )

  const pathFor = useCallback(
    (view: View) => viewPath(role, view, { patient: demo.patient, reviewCandidate }),
    [role, demo.patient, reviewCandidate],
  )

  const context = useMemo<AppContextValue>(
    () => ({
      demo,
      role,
      candidateId,
      reviewCandidate,
      setReviewCandidate,
      updatePatient,
      updateEvent,
      updateCandidate,
      notify: setNotice,
      goTo: (view) => navigate(pathFor(view)),
      pathFor,
    }),
    [
      demo,
      role,
      candidateId,
      reviewCandidate,
      updatePatient,
      updateEvent,
      updateCandidate,
      navigate,
      pathFor,
    ],
  )

  const switchRole = () => navigate(roleHome(role === 'candidate' ? 'educator' : 'candidate'))

  const switchCandidate = (id: CandidateId) => {
    session.switchCandidate?.(id)
    navigate(roleHome('candidate'))
  }

  const work = demo.candidates[candidateId]
  const hasUnread = demo.event.released && !work.inboxOpened

  return (
    <AppContext.Provider value={context}>
      <div className="app-shell">
        <TitleBar
          role={role}
          displayName={role === 'candidate' ? candidateNames[candidateId] : 'Educator demo'}
          onSwitchRole={switchRole}
        />
        <Ribbon role={role} hasUnread={hasUnread} pathFor={pathFor} />
        <PatientBanner patient={demo.patient} />

        <div className="workspace">
          <Sidebar
            role={role}
            currentView={currentView}
            candidateId={candidateId}
            hasUnread={hasUnread}
            pathFor={pathFor}
            onCandidateChange={session.switchCandidate ? switchCandidate : undefined}
          />

          <main className="main-panel" id="main-panel">
            <Outlet />
          </main>

          <RightPanel role={role} patient={demo.patient} event={demo.event} work={work} />
        </div>

        <StatusBar />

        {notice && (
          <div className="toast show" role="status">
            {notice}
          </div>
        )}
      </div>
    </AppContext.Provider>
  )
}
