import { PageHead } from '../../components/PageHead'
import type { CandidateFlowProps } from '../types'

function ProgressStep(props: { step: number; state: string; title: string; detail: string }) {
  return (
    <div className={`progress-step ${props.state}`}>
      <span>{props.step}</span>
      <div>
        <strong>{props.title}</strong>
        <small>{props.detail}</small>
      </div>
    </div>
  )
}

export function OverviewView({ patient, event, work, onNavigate }: CandidateFlowProps) {
  const responseState = work.responseSubmitted ? 'done' : event.released ? 'current' : ''
  const responseDetail = work.responseSubmitted
    ? 'Submitted'
    : event.released
      ? 'Inbox item available'
      : 'Waiting for release'

  return (
    <>
      <PageHead
        title="Patient overview"
        description="Review the fictional record and continue the current encounter."
        breadcrumb={['Cases', patient.name, 'Overview']}
        action={
          <button className="primary-button" onClick={() => onNavigate('clinical-notes')}>
            Open consultation →
          </button>
        }
      />

      <div className="overview-grid">
        <article className="card encounter-card">
          <div className="card-heading">
            <div>
              <span className="section-kicker">ACTIVE SCENARIO</span>
              <h3>{patient.scenario}</h3>
            </div>
            <span className="soft-pill">In progress</span>
          </div>
          <p className="muted">{patient.opening}</p>
          <div className="progress-steps">
            <ProgressStep
              step={1}
              state="done"
              title="Review patient"
              detail="Background available"
            />
            <ProgressStep
              step={2}
              state={work.noteSubmitted ? 'done' : 'current'}
              title="Consultation"
              detail={work.noteSubmitted ? 'Submitted' : 'Ready to complete'}
            />
            <ProgressStep
              step={3}
              state={responseState}
              title="Result response"
              detail={responseDetail}
            />
          </div>
          <button className="text-button" onClick={() => onNavigate('clinical-notes')}>
            Continue encounter →
          </button>
        </article>

        <article className="card snapshot-card">
          <div className="card-heading">
            <div>
              <span className="section-kicker">AT A GLANCE</span>
              <h3>Patient snapshot</h3>
            </div>
          </div>
          <div className="snapshot-row">
            <span>Past history</span>
            <strong>{patient.history}</strong>
          </div>
          <div className="snapshot-row">
            <span>Baseline medicines</span>
            <strong>{patient.medicines}</strong>
          </div>
          <div className="snapshot-row">
            <span>Communication</span>
            <strong>{patient.context}</strong>
          </div>
          <button className="text-button" onClick={() => onNavigate('history')}>
            View background →
          </button>
        </article>
      </div>

      <article className="card activity-card">
        <div className="card-heading">
          <div>
            <span className="section-kicker">CASE TIMELINE</span>
            <h3>Learning activity</h3>
          </div>
        </div>
        <div className="timeline-item">
          <span className="timeline-point teal" />
          <div>
            <strong>Case available</strong>
            <p>Patient record and opening scenario published</p>
          </div>
        </div>
        {event.released && (
          <div className="timeline-item">
            <span className="timeline-point teal" />
            <div>
              <strong>{event.title} released</strong>
              <p>Open the inbox to review and respond</p>
            </div>
            <button className="text-button" onClick={() => onNavigate('inbox')}>
              Open →
            </button>
          </div>
        )}
        {work.feedbackReleased && (
          <div className="timeline-item">
            <span className="timeline-point teal" />
            <div>
              <strong>Educator feedback available</strong>
              <p>Read comments on your work</p>
            </div>
            <button className="text-button" onClick={() => onNavigate('feedback')}>
              Read →
            </button>
          </div>
        )}
      </article>
    </>
  )
}
