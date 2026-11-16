import type { PatientCase } from '../../model'
import { PageHead } from '../../components/PageHead'
import type { EducatorViewProps } from './types'

type PatientTextKey = 'name' | 'id' | 'pronouns' | 'scenario'
type PatientLongKey = 'history' | 'medicines' | 'context' | 'opening'

const longFields: { key: PatientLongKey; label: string }[] = [
  { key: 'history', label: 'Past history' },
  { key: 'medicines', label: 'Baseline medicines' },
  { key: 'context', label: 'Communication and care context' },
  { key: 'opening', label: 'Consultation opening' },
]

export function CaseEditorView({ patient, onPatientChange, onNotice }: EducatorViewProps) {
  const textInput = (key: PatientTextKey, label: string, wide = false) => (
    <label className={wide ? 'wide' : undefined}>
      {label}
      <input
        value={patient[key]}
        onChange={(e) => onPatientChange({ [key]: e.target.value } as Partial<PatientCase>)}
      />
    </label>
  )

  return (
    <>
      <PageHead
        title="Case editor"
        description="Write the fictional patient record and opening scenario."
        breadcrumb={['Educator', 'Cases', 'Editor']}
        action={<span className="soft-pill">{patient.published ? 'Published' : 'Draft'}</span>}
      />
      <article className="card form-card">
        <div className="form-grid">
          {textInput('name', 'Patient name')}
          {textInput('id', 'Simulation ID')}
          <label>
            Age
            <input
              type="number"
              min="0"
              value={patient.age}
              onChange={(e) => onPatientChange({ age: Number(e.target.value) })}
            />
          </label>
          {textInput('pronouns', 'Pronouns')}
          {textInput('scenario', 'Scenario title', true)}
          {longFields.map((field) => (
            <label className="wide" key={field.key}>
              {field.label}
              <textarea
                value={patient[field.key]}
                onChange={(e) => onPatientChange({ [field.key]: e.target.value })}
              />
            </label>
          ))}
        </div>
        <div className="editor-footer">
          <span>Changes are stored in this browser for the demo.</span>
          <div className="button-row">
            <button
              className="secondary-button"
              onClick={() => onNotice('Case draft saved locally')}
            >
              Save draft
            </button>
            <button
              className="primary-button"
              onClick={() => {
                onPatientChange({ published: !patient.published })
                onNotice(patient.published ? 'Case moved to draft' : 'Case published')
              }}
            >
              {patient.published ? 'Move to draft' : 'Publish case'}
            </button>
          </div>
        </div>
      </article>
    </>
  )
}
