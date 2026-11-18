import { Circle, CircleCheck, Info, Lightbulb } from 'lucide-react'
import type { CandidateWork, PatientCase, Role, ScenarioEvent } from '../model'
import type { DataSourceName } from '../data/sources'

interface RightPanelProps {
  role: Role
  /** Null while cases load from the backend, or if there are none. */
  patient: PatientCase | null
  event: ScenarioEvent
  work: CandidateWork
  casesSource: DataSourceName
}

function CheckRow({ done, label }: { done: boolean; label: string }) {
  return (
    <li className={`check-row ${done ? 'done' : ''}`}>
      {done ? (
        <CircleCheck aria-hidden="true" size={16} />
      ) : (
        <Circle aria-hidden="true" size={16} />
      )}
      {label}
      <span className="visually-hidden">{done ? ' (done)' : ' (not done)'}</span>
    </li>
  )
}

function StatusRow({ label }: { label: string }) {
  return (
    <li className="check-row">
      <Info aria-hidden="true" size={16} />
      {label}
    </li>
  )
}

/** The panel's content, shared by the desktop side panel and the collapsible version. */
function CaseInfoContent({ role, patient, event, work, casesSource }: RightPanelProps) {
  const candidate = role === 'candidate'
  const hasUnread = event.released && !work.inboxOpened

  const focusText = candidate
    ? hasUnread
      ? 'A new inbox item is ready to review.'
      : 'Work through the case and document your clinical reasoning.'
    : 'Edit the case, release an inbox event, and review each candidate separately.'

  return (
    <div className="right-panel-body">
      <div className="attention-card">
        <div className="attention-head">
          <Lightbulb aria-hidden="true" size={18} />
          <strong>{candidate ? 'Current focus' : 'Demo controls'}</strong>
        </div>
        <p>{focusText}</p>
      </div>

      <div className="panel-block">
        <h3 className="panel-heading">{candidate ? 'Your progress' : 'Case status'}</h3>
        <ul className="check-list">
          {candidate ? (
            <>
              <CheckRow done label="Patient record available" />
              <CheckRow done={work.noteSubmitted} label="Consultation note" />
              <CheckRow done={work.responseSubmitted} label="Inbox response" />
              <CheckRow done={work.feedbackReleased} label="Educator feedback" />
            </>
          ) : (
            <>
              <StatusRow
                label={
                  !patient
                    ? 'No case loaded'
                    : patient.published
                      ? 'Case published'
                      : 'Case held as draft'
                }
              />
              <StatusRow label={event.released ? 'Event released' : 'Event held'} />
              <StatusRow label="Individual candidate workspaces" />
            </>
          )}
        </ul>
      </div>

      <div className="panel-block">
        <h3 className="panel-heading">About this prototype</h3>
        <p className="panel-copy">
          {casesSource === 'api'
            ? 'Cases and patients come from the backend API. Other data and demo accounts are stored in this browser. Server authentication is future integration work.'
            : 'Interface, data, and demo accounts are stored in this browser. Server authentication, clinical API calls, and database persistence are future integration work.'}
        </p>
      </div>
    </div>
  )
}

/** Side panel on wide screens. */
export function RightPanel(props: RightPanelProps) {
  return (
    <aside className="right-panel" aria-label="Case information">
      <div className="right-panel-header">
        {props.role === 'candidate' ? 'Learning summary' : 'Educator summary'}
      </div>
      <CaseInfoContent {...props} />
    </aside>
  )
}

/** The same information as a collapsible section, shown above the page on smaller screens. */
export function CaseInfoDisclosure(props: RightPanelProps) {
  return (
    <details className="case-info">
      <summary>Case info</summary>
      <CaseInfoContent {...props} />
    </details>
  )
}
