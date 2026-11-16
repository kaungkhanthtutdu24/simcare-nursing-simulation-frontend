import { useEffect, useState } from 'react'
import { candidateNames, loadDemoState, saveDemoState } from './model'
import type {
  CandidateId,
  CandidateWork,
  DemoState,
  PatientCase,
  Role,
  ScenarioEvent,
  View,
} from './model'
import { PatientBanner } from './components/PatientBanner'
import { Ribbon } from './components/Ribbon'
import { RightPanel } from './components/RightPanel'
import { Sidebar } from './components/Sidebar'
import { StatusBar } from './components/StatusBar'
import { TitleBar } from './components/TitleBar'
import { CandidateRouter } from './views/CandidateRouter'
import { EducatorRouter } from './views/EducatorRouter'

const NOTICE_DURATION_MS = 3200

/** Clears a candidate's inbox progress when a new event is released. */
const resetInbox = (work: CandidateWork): CandidateWork => ({
  ...work,
  inboxOpened: false,
  response: '',
  responseSubmitted: false,
})

function App() {
  const [demo, setDemo] = useState<DemoState>(loadDemoState)
  const [role, setRole] = useState<Role>('candidate')
  const [candidateId, setCandidateId] = useState<CandidateId>('candidate-01')
  const [selectedReview, setSelectedReview] = useState<CandidateId>('candidate-01')
  const [view, setView] = useState<View>('cases')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    saveDemoState(demo)
  }, [demo])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), NOTICE_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [notice])

  const updatePatient = (patch: Partial<PatientCase>) =>
    setDemo((prev) => ({ ...prev, patient: { ...prev.patient, ...patch } }))

  const updateEvent = (patch: Partial<ScenarioEvent>) =>
    setDemo((prev) => {
      const event = { ...prev.event, ...patch }
      const releasedNow = patch.released === true && !prev.event.released
      if (!releasedNow) return { ...prev, event }
      return {
        ...prev,
        event,
        candidates: {
          'candidate-01': resetInbox(prev.candidates['candidate-01']),
          'candidate-02': resetInbox(prev.candidates['candidate-02']),
        },
      }
    })

  const updateCandidate = (id: CandidateId, patch: Partial<CandidateWork>) =>
    setDemo((prev) => ({
      ...prev,
      candidates: { ...prev.candidates, [id]: { ...prev.candidates[id], ...patch } },
    }))

  const switchRole = () => {
    setRole((prev) => (prev === 'candidate' ? 'educator' : 'candidate'))
    setView('cases')
  }

  const switchCandidate = (id: CandidateId) => {
    setCandidateId(id)
    setView('cases')
  }

  const isCandidate = role === 'candidate'
  const work = demo.candidates[candidateId]
  const hasUnread = demo.event.released && !work.inboxOpened

  return (
    <div className="app-shell">
      <TitleBar
        role={role}
        displayName={isCandidate ? candidateNames[candidateId] : 'Educator demo'}
        onSwitchRole={switchRole}
      />
      <Ribbon role={role} hasUnread={hasUnread} onNavigate={setView} />
      <PatientBanner patient={demo.patient} />

      <div className="workspace">
        <Sidebar
          role={role}
          view={view}
          candidateId={candidateId}
          hasUnread={hasUnread}
          onNavigate={setView}
          onCandidateChange={switchCandidate}
        />

        <main className="main-panel" id="main-panel">
          {isCandidate ? (
            <CandidateRouter
              view={view}
              patient={demo.patient}
              event={demo.event}
              work={work}
              onNavigate={setView}
              onUpdate={(patch) => updateCandidate(candidateId, patch)}
              onNotice={setNotice}
            />
          ) : (
            <EducatorRouter
              view={view}
              patient={demo.patient}
              event={demo.event}
              candidates={demo.candidates}
              selectedCandidate={selectedReview}
              onCandidateChange={setSelectedReview}
              onPatientChange={updatePatient}
              onEventChange={updateEvent}
              onCandidateUpdate={(patch) => updateCandidate(selectedReview, patch)}
              onNavigate={setView}
              onNotice={setNotice}
            />
          )}
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
  )
}

export default App
