import { PageHead } from '../../components/PageHead'
import type { CandidateFlowProps } from '../types'

export function CasesView({ patient, event, work, onNavigate }: CandidateFlowProps) {
  return (
    <>
      <PageHead
        title="My cases"
        description="Open a published simulation case and continue your work."
        breadcrumb={['Cases', 'My cases']}
      />
      {patient.published ? (
        <article className="card case-list-card">
          <div className="case-monogram">AW</div>
          <div className="case-list-copy">
            <span className="section-kicker">PUBLISHED CASE · {patient.id}</span>
            <h3>{patient.name}</h3>
            <p>{patient.scenario}</p>
            <div className="case-meta">
              <span>{work.noteSubmitted ? 'Initial note submitted' : 'Initial note pending'}</span>
              <span>
                {event.released && !work.inboxOpened ? '1 new inbox item' : 'No new items'}
              </span>
            </div>
          </div>
          <button className="primary-button" onClick={() => onNavigate('overview')}>
            Open record →
          </button>
        </article>
      ) : (
        <article className="card empty-state">
          <h3>No published cases yet</h3>
          <p>Your educator will make a case available here.</p>
        </article>
      )}
    </>
  )
}
