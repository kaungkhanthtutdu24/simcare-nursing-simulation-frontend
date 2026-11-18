import type { CandidateId } from '../../model'
import { candidateDisplayName } from '../../auth/localAccounts'
import { PageHead } from '../../components/PageHead'
import type { EducatorViewProps } from './types'

export function EducatorCasesView({
  patient,
  event,
  candidates,
  onCandidateChange,
  onNavigate,
}: EducatorViewProps) {
  const candidateIds = Object.keys(candidates) as CandidateId[]

  return (
    <>
      <PageHead
        title="Case management"
        description="Edit the teaching case, release an event, and review each candidate’s work."
        breadcrumb={['Educator', 'Cases']}
        action={
          <button className="primary-button" onClick={() => onNavigate('case-editor')}>
            Edit case →
          </button>
        }
      />

      <article className="card case-list-card">
        <div className="case-monogram">AW</div>
        <div className="case-list-copy">
          <span className="section-kicker">
            {patient.published ? 'PUBLISHED' : 'DRAFT'} · {patient.id}
          </span>
          <h3>{patient.name}</h3>
          <p>{patient.scenario}</p>
          <div className="case-meta">
            <span>{candidateIds.length} candidate workspaces</span>
            <span>{event.released ? 'Event released' : 'Event held'}</span>
          </div>
        </div>
      </article>

      <div className="two-col">
        <article className="card">
          <span className="section-kicker">CASE CONTENT</span>
          <h3>Patient record</h3>
          <p className="muted">Edit the fictional background and consultation opening.</p>
          <button className="text-button" onClick={() => onNavigate('case-editor')}>
            Open editor →
          </button>
        </article>
        <article className="card">
          <span className="section-kicker">SCENARIO EVENT</span>
          <h3>{event.title}</h3>
          <p className="muted">
            {event.released ? 'Available in candidate inboxes.' : 'Held until you release it.'}
          </p>
          <button className="text-button" onClick={() => onNavigate('release')}>
            Manage release →
          </button>
        </article>
      </div>

      <article className="card">
        <div className="card-heading">
          <div>
            <span className="section-kicker">CANDIDATE PROGRESS</span>
            <h3>Individual responses</h3>
          </div>
        </div>
        {candidateIds.map((id) => (
          <div className="candidate-row" key={id}>
            <div>
              <strong>{candidateDisplayName(id)}</strong>
              <small>
                {candidates[id].noteSubmitted ? 'Consultation submitted' : 'Consultation pending'} ·{' '}
                {candidates[id].responseSubmitted
                  ? 'Result response submitted'
                  : 'Result response pending'}
              </small>
            </div>
            <button className="text-button" onClick={() => onCandidateChange(id)}>
              Review →
            </button>
          </div>
        ))}
      </article>
    </>
  )
}
