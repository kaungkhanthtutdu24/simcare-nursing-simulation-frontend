import type { ScenarioEvent } from '../../model'
import { PageHead } from '../../components/PageHead'
import type { EducatorViewProps } from './types'

const eventKinds: ScenarioEvent['kind'][] = [
  'Laboratory result',
  'Correspondence',
  'Condition update',
]

export function EventReleaseView({ event, onEventChange, onNotice }: EducatorViewProps) {
  const { released } = event
  const canRelease = event.title.trim() !== '' && event.content.trim() !== ''

  return (
    <>
      <PageHead
        title="Scenario event"
        description="Prepare a result, correspondence item, or condition update for the candidate inboxes."
        breadcrumb={['Educator', 'Event release']}
        action={<span className="soft-pill">{released ? 'Released' : 'Held'}</span>}
      />
      <article className="card form-card">
        <div className="form-grid">
          <label>
            Event title
            <input
              value={event.title}
              readOnly={released}
              onChange={(e) => onEventChange({ title: e.target.value })}
            />
          </label>
          <label>
            Event type
            <select
              value={event.kind}
              disabled={released}
              onChange={(e) => onEventChange({ kind: e.target.value as ScenarioEvent['kind'] })}
            >
              {eventKinds.map((kind) => (
                <option key={kind}>{kind}</option>
              ))}
            </select>
          </label>
          <label className="wide">
            Content
            <textarea
              className="large-textarea"
              value={event.content}
              readOnly={released}
              onChange={(e) => onEventChange({ content: e.target.value })}
            />
          </label>
        </div>
        <div className="editor-footer">
          <span>
            {released
              ? 'Visible in both candidate inboxes. Hold it to edit.'
              : 'Candidates cannot see this item yet.'}
          </span>
          <div className="button-row">
            <button
              className="secondary-button"
              onClick={() => onNotice('Event draft saved locally')}
            >
              Save draft
            </button>
            <button
              className="primary-button"
              disabled={!canRelease}
              onClick={() => {
                onEventChange({ released: !released })
                onNotice(released ? 'Event held' : 'Event released')
              }}
            >
              {released ? 'Hold event' : 'Release to candidates'}
            </button>
          </div>
        </div>
      </article>
    </>
  )
}
