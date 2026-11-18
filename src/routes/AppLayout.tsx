import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, useLocation, useMatches, useNavigate } from 'react-router'
import { emptyCandidate, loadDemoState, saveDemoState } from '../model'
import type {
  CandidateId,
  CandidateWork,
  DemoState,
  PatientCase,
  Role,
  ScenarioEvent,
  View,
} from '../model'
import { useAuth, useSession } from '../auth/session'
import { useCases } from '../data/useCases'
import { PatientBanner } from '../components/PatientBanner'
import { Ribbon } from '../components/Ribbon'
import { CaseInfoDisclosure, RightPanel } from '../components/RightPanel'
import { Sidebar } from '../components/Sidebar'
import { StatusBar } from '../components/StatusBar'
import { TitleBar } from '../components/TitleBar'
import { AppContext } from './appContext'
import type { AppContextValue } from './appContext'
import { paths, routeParamsExist, viewPath } from './paths'

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
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const matches = useMatches()

  const [demo, setDemo] = useState<DemoState>(() => {
    const state = loadDemoState()
    if (session.role === 'candidate' && !Object.hasOwn(state.candidates, session.candidateId)) {
      state.candidates[session.candidateId] = emptyCandidate(state.patient.name)
    }
    return state
  })
  const [reviewCandidate, setReviewCandidate] = useState<CandidateId>('candidate-01')
  const [notice, setNotice] = useState('')
  // The mobile menu is open only on the page where it was opened, so it closes on navigation.
  const { pathname } = useLocation()
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null)
  const menuOpen = menuOpenOn === pathname
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const role: Role = session.role
  const candidateId = session.candidateId
  // Highlight the sidebar item for the current route, unless the URL has an
  // unknown case/patient/candidate ID (the page then shows "not found").
  const lastMatch = matches.at(-1)

  const updateDemoCase = useCallback(
    (patch: Partial<PatientCase>) =>
      setDemo((prev) => ({ ...prev, patient: { ...prev.patient, ...patch } })),
    [],
  )
  const cases = useCases({
    role,
    caseId: lastMatch?.params.caseId,
    demoCase: demo.patient,
    updateDemoCase,
  })
  const currentCase = cases.current

  const currentView =
    lastMatch &&
    routeParamsExist(lastMatch.params, {
      caseKeys: cases.caseKeys,
      patient: currentCase,
      candidateIds: Object.keys(demo.candidates),
    })
      ? (lastMatch.handle as RouteHandle | undefined)?.view
      : undefined

  useEffect(() => {
    saveDemoState(demo)
  }, [demo])

  const closeMenu = useCallback(() => {
    setMenuOpenOn((openOn) => {
      if (openOn !== null) menuButtonRef.current?.focus()
      return null
    })
  }, [])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), NOTICE_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [notice])

  const updateEvent = useCallback(
    (patch: Partial<ScenarioEvent>) =>
      setDemo((prev) => {
        const event = { ...prev.event, ...patch }
        const releasedNow = patch.released === true && !prev.event.released
        if (!releasedNow) return { ...prev, event }
        const candidates = { ...prev.candidates }
        for (const id of Object.keys(candidates)) candidates[id] = resetInbox(prev.candidates[id])
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
    (view: View) => viewPath(role, view, { patient: currentCase, reviewCandidate }),
    [role, currentCase, reviewCandidate],
  )

  const context = useMemo<AppContextValue>(
    () => ({
      demo,
      role,
      candidateId,
      reviewCandidate,
      setReviewCandidate,
      cases,
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
      cases,
      updateEvent,
      updateCandidate,
      navigate,
      pathFor,
    ],
  )

  const work = demo.candidates[candidateId]
  const hasUnread = demo.event.released && !work.inboxOpened
  // The patient banner and case panel belong to case pages, not the dashboard or profile.
  const onCasePage = lastMatch?.params.caseId !== undefined && currentCase !== null
  const showCaseInfo = currentView !== 'dashboard' && currentView !== 'profile'
  const panelProps = {
    role,
    patient: currentCase,
    event: demo.event,
    work,
    casesSource: cases.source,
  }

  return (
    <AppContext.Provider value={context}>
      <div className={`app-shell ${showCaseInfo ? '' : 'no-case-panel'}`}>
        <a className="skip-link" href="#main-panel">
          Skip to main content
        </a>
        <TitleBar
          role={role}
          displayName={session.name}
          onSignOut={() => {
            signOut()
            navigate(paths.signIn, { replace: true })
          }}
          menuOpen={menuOpen}
          onToggleMenu={() => setMenuOpenOn(menuOpen ? null : pathname)}
          menuButtonRef={menuButtonRef}
        />
        {onCasePage && <Ribbon role={role} hasUnread={hasUnread} pathFor={pathFor} />}
        {onCasePage && currentCase && <PatientBanner patient={currentCase} />}

        <div className="workspace">
          <Sidebar
            role={role}
            currentView={currentView}
            hasUnread={hasUnread}
            hasCase={currentCase !== null}
            pathFor={pathFor}
            open={menuOpen}
            onClose={closeMenu}
          />

          <main className="main-panel" id="main-panel" tabIndex={-1}>
            {showCaseInfo && <CaseInfoDisclosure {...panelProps} />}
            <Outlet />
            {notice && (
              <div className="toast show" role="status">
                {notice}
              </div>
            )}
          </main>

          {showCaseInfo && <RightPanel {...panelProps} />}
        </div>

        <StatusBar casesSource={cases.source} />
      </div>
    </AppContext.Provider>
  )
}
