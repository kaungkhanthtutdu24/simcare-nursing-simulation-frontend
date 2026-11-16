import type { CandidateWork, PatientCase, Role, ScenarioEvent } from '../model'

interface RightPanelProps {
  role: Role
  patient: PatientCase
  event: ScenarioEvent
  work: CandidateWork
}

function CheckRow({ done, label }: { done: boolean; label: string }) {
  return (
    <div className={`check-row ${done ? 'done' : ''}`}>
      <span>{done ? '✓' : '○'}</span>
      {label}
    </div>
  )
}

function StatusRow({ label }: { label: string }) {
  return (
    <div className="check-row">
      <span>•</span>
      {label}
    </div>
  )
}

export function RightPanel({ role, patient, event, work }: RightPanelProps) {
  const candidate = role === 'candidate'
  const hasUnread = event.released && !work.inboxOpened

  const focusText = candidate
    ? hasUnread
      ? 'A new inbox item is ready to review.'
      : 'Work through the case and document your clinical reasoning.'
    : 'Edit the case, release an inbox event, and review each candidate separately.'

  return (
    <aside className="right-panel">
      <div className="right-panel-header">
        {candidate ? 'LEARNING DASHBOARD' : 'EDUCATOR DASHBOARD'}
        <span>•••</span>
      </div>
      <div className="right-panel-body">
        <div className="attention-card">
          <div className="attention-head">
            <span className="attention-icon">!</span>
            <strong>{candidate ? 'Current focus' : 'Demo controls'}</strong>
          </div>
          <p>{focusText}</p>
        </div>

        <div className="panel-block">
          <div className="panel-heading">
            <h3>{candidate ? 'Your progress' : 'Case status'}</h3>
          </div>
          {candidate ? (
            <>
              <CheckRow done label="Patient record available" />
              <CheckRow done={work.noteSubmitted} label="Consultation note" />
              <CheckRow done={work.responseSubmitted} label="Inbox response" />
              <CheckRow done={work.feedbackReleased} label="Educator feedback" />
            </>
          ) : (
            <>
              <StatusRow label={patient.published ? 'Case published' : 'Case held as draft'} />
              <StatusRow label={event.released ? 'Event released' : 'Event held'} />
              <StatusRow label="Two independent candidates" />
            </>
          )}
        </div>

        <div className="panel-block">
          <div className="panel-heading">
            <h3>About this prototype</h3>
          </div>
          <p className="panel-copy">
            Interface and data are stored in this browser. Authentication, API calls, and database
            persistence are future integration work.
          </p>
        </div>
      </div>
    </aside>
  )
}
