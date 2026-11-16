import { PageHead } from '../../components/PageHead'
import type { CandidateFlowProps } from '../types'

export function InboxView({ patient, event, work, onUpdate, onNotice }: CandidateFlowProps) {
  const status = work.responseSubmitted
    ? 'Response submitted'
    : work.inboxOpened
      ? 'Opened · response pending'
      : 'Unread'

  return (
    <>
      <PageHead
        title="Clinical inbox"
        description="Read released information and document a linked response."
        breadcrumb={['Cases', patient.name, 'Inbox']}
        action={
          <span className="soft-pill">
            {event.released && !work.inboxOpened ? '1 unread' : 'No unread items'}
          </span>
        }
      />

      {!event.released ? (
        <article className="card empty-state">
          <h3>No released items</h3>
          <p>Results and correspondence will appear here when your educator releases them.</p>
        </article>
      ) : (
        <article className="card result-card">
          <div className="result-icon">▥</div>
          <div className="result-body">
            <div className="card-heading">
              <div>
                <span className="section-kicker">
                  {event.kind.toUpperCase()} · {patient.id}
                </span>
                <h3>{event.title}</h3>
              </div>
              <span className="unread-pill">{status}</span>
            </div>
            <p>Patient: {patient.name}. Read status and response status are tracked separately.</p>

            {work.inboxOpened ? (
              <div className="result-detail">
                <strong>Released content</strong>
                <p>{event.content}</p>
              </div>
            ) : (
              <button className="primary-button" onClick={() => onUpdate({ inboxOpened: true })}>
                Open item
              </button>
            )}

            {work.inboxOpened && (
              <div className="response-editor">
                <label className="input-label" htmlFor="result-response">
                  Your interpretation and next action
                </label>
                <textarea
                  id="result-response"
                  value={work.response}
                  readOnly={work.responseSubmitted}
                  onChange={(e) => onUpdate({ response: e.target.value })}
                  placeholder="Interpretation, urgency, patient contact, management and follow-up..."
                />
                <div className="editor-footer">
                  <span>
                    {work.responseSubmitted
                      ? 'Response submitted'
                      : 'Response is linked to this inbox item.'}
                  </span>
                  <button
                    className="primary-button"
                    disabled={work.responseSubmitted || !work.response.trim()}
                    onClick={() => {
                      onUpdate({ responseSubmitted: true })
                      onNotice('Response submitted')
                    }}
                  >
                    Submit response
                  </button>
                </div>
              </div>
            )}
          </div>
        </article>
      )}
    </>
  )
}
