import type { SoapNote } from '../../model'
import { PageHead } from '../../components/PageHead'
import type { CandidateViewProps } from '../types'

const soapFields: { key: keyof SoapNote; label: string; placeholder: string }[] = [
  { key: 'subjective', label: 'Subjective', placeholder: 'Patient-reported symptoms and concerns' },
  { key: 'objective', label: 'Objective', placeholder: 'Examination and observations' },
  { key: 'assessment', label: 'Assessment', placeholder: 'Interpretation and clinical reasoning' },
  {
    key: 'plan',
    label: 'Plan',
    placeholder: 'Investigations, management, follow-up and safety netting',
  },
]

export function ClinicalNotesView({ patient, work, onUpdate, onNotice }: CandidateViewProps) {
  const { soap, noteSubmitted } = work
  const canSubmit = Object.values(soap).some((value) => value.trim().length > 0)
  const updateSoap = (patch: Partial<SoapNote>) => onUpdate({ soap: { ...soap, ...patch } })

  const submit = () => {
    onUpdate({
      note: soapFields.map((field) => `${field.label}: ${soap[field.key]}`).join('\n'),
      noteSubmitted: true,
    })
    onNotice('Clinical note submitted')
  }

  return (
    <>
      <PageHead
        title="Clinical notes"
        description="Document the encounter in subjective, objective, assessment, and plan fields."
        breadcrumb={['Cases', 'Patient record', 'Clinical notes']}
      />
      <article className="card form-card">
        <div className="card-heading">
          <div>
            <span className="section-kicker">SOAP NOTE</span>
            <h3>{patient.scenario}</h3>
          </div>
          <span className="soft-pill">{noteSubmitted ? 'Submitted' : 'Draft'}</span>
        </div>
        <div className="form-grid">
          {soapFields.map((field) => (
            <label className="wide" key={field.key}>
              {field.label}
              <textarea
                value={soap[field.key]}
                readOnly={noteSubmitted}
                onChange={(e) => updateSoap({ [field.key]: e.target.value })}
                placeholder={field.placeholder}
              />
            </label>
          ))}
        </div>
        <div className="editor-footer">
          <span>
            {noteSubmitted
              ? 'Submitted notes are read-only in this demo.'
              : 'Draft saved automatically in this browser.'}
          </span>
          <div className="button-row">
            <button
              className="secondary-button"
              disabled={noteSubmitted}
              onClick={() => onNotice('Clinical note saved locally')}
            >
              Save draft
            </button>
            <button
              className="primary-button"
              disabled={noteSubmitted || !canSubmit}
              onClick={submit}
            >
              Submit note
            </button>
          </div>
        </div>
      </article>
    </>
  )
}
