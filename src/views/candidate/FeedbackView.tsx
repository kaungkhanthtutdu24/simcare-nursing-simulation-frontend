import { PageHead } from '../../components/PageHead'
import type { CandidateViewProps } from '../types'

export function FeedbackView({ patient, work }: CandidateViewProps) {
  return (
    <>
      <PageHead
        title="Educator feedback"
        description="Read formative comments released for your work."
        breadcrumb={['Cases', patient.name, 'Feedback']}
      />
      {work.feedbackReleased ? (
        <article className="card">
          <span className="section-kicker">RELEASED FEEDBACK</span>
          <h3>{patient.scenario}</h3>
          <p className="feedback-text">{work.feedback}</p>
        </article>
      ) : (
        <article className="card empty-state">
          <h3>No feedback released yet</h3>
          <p>Your educator’s comments will appear here after they are released.</p>
        </article>
      )}
    </>
  )
}
