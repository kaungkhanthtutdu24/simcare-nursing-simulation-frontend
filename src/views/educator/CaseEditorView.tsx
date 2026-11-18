import { useState } from 'react'
import type { PatientCase } from '../../model'
import { ApiError } from '../../api/http'
import { ErrorState } from '../../components/AsyncState'
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

export function CaseEditorView({
  patient,
  onPatientChange,
  caseSource,
  caseDirty,
  onSaveCase,
  onSetPublished,
  onNotice,
}: EducatorViewProps) {
  const api = caseSource === 'api'
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  /** Runs a save or publish, showing a notice on success and the error on failure. */
  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true)
    setError(null)
    try {
      await action()
      onNotice(success)
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e
          : new ApiError({ kind: 'http', message: String(e), method: 'PUT', path: '' }),
      )
    } finally {
      setBusy(false)
    }
  }

  const footerText = !api
    ? 'Changes are stored in this browser for the demo.'
    : caseDirty
      ? 'Unsaved changes. Save the draft to update the backend.'
      : 'All changes are saved to the backend.'

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
        {error && <ErrorState error={error} />}
        <div className="editor-footer">
          <span>{busy ? 'Saving…' : footerText}</span>
          <div className="button-row">
            <button
              className="secondary-button"
              disabled={busy}
              onClick={() =>
                run(onSaveCase, api ? 'Case saved to the backend' : 'Case draft saved locally')
              }
            >
              Save draft
            </button>
            <button
              className="primary-button"
              disabled={busy}
              onClick={() =>
                run(
                  () => onSetPublished(!patient.published),
                  patient.published ? 'Case moved to draft' : 'Case published',
                )
              }
            >
              {patient.published ? 'Move to draft' : 'Publish case'}
            </button>
          </div>
        </div>
      </article>
    </>
  )
}
