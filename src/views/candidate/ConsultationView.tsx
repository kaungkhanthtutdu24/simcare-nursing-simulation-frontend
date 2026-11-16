import { PageHead } from '../../components/PageHead'
import type { CandidateViewProps } from '../types'

/** Free-text consultation note (legacy screen; the SOAP note is in ClinicalNotesView). */
export function ConsultationView({ patient, work, onUpdate, onNotice }: CandidateViewProps) {
  const { note, noteSubmitted } = work

  return (
    <>
      <PageHead
        title="Consultation note"
        description="Document your assessment, reasoning, management, and follow-up."
        breadcrumb={['Cases', patient.name, 'Consultation']}
        action={<span className="soft-pill">{noteSubmitted ? 'Submitted' : 'Draft'}</span>}
      />
      <article className="card editor-card">
        <div className="card-heading">
          <div>
            <span className="section-kicker">INITIAL ENCOUNTER</span>
            <h3>{patient.scenario}</h3>
          </div>
          <span className="muted small">{patient.id}</span>
        </div>
        <label className="input-label" htmlFor="consultation-note">
          Clinical note
        </label>
        <textarea
          id="consultation-note"
          value={note}
          readOnly={noteSubmitted}
          onChange={(e) => onUpdate({ note: e.target.value })}
          placeholder="Assessment, interpretation, differential diagnoses, rationale, management and follow-up..."
        />
        <div className="editor-footer">
          <span>
            {noteSubmitted
              ? 'Submitted notes are read-only in this prototype.'
              : 'Draft text is stored locally in this browser.'}
          </span>
          <div className="button-row">
            <button
              className="secondary-button"
              disabled={noteSubmitted}
              onClick={() => onNotice('Draft saved locally')}
            >
              Save draft
            </button>
            <button
              className="primary-button"
              disabled={noteSubmitted || !note.trim()}
              onClick={() => {
                onUpdate({ noteSubmitted: true })
                onNotice('Consultation submitted')
              }}
            >
              Submit note
            </button>
          </div>
        </div>
      </article>
      <article className="card hint-card">
        <strong>Reasoning prompts</strong>
        <p>
          What do the findings mean? What possibilities did you consider? Why is your plan
          appropriate? Record proposed tests, referrals, medicines, and follow-up in the note for
          this first prototype.
        </p>
      </article>
    </>
  )
}
