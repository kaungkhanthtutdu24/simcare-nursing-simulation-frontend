import type { Medication } from '../../model'
import { newMedication } from '../../model'
import { PageHead } from '../../components/PageHead'
import { RepeatCard } from '../../components/RepeatCard'
import { removeById, updateById } from '../types'
import type { CandidateViewProps } from '../types'

/** Single-line text fields shown for every medication, in display order. */
const textFields: { key: keyof Medication; label: string; placeholder?: string }[] = [
  { key: 'name', label: 'Medicine name', placeholder: 'Generic or brand name' },
  { key: 'dose', label: 'Dose', placeholder: 'As documented in case' },
  { key: 'route', label: 'Route', placeholder: 'Oral, topical, inhaled...' },
  { key: 'frequency', label: 'Frequency', placeholder: 'Scheduled or as needed' },
  { key: 'indication', label: 'Indication' },
  { key: 'status', label: 'Status', placeholder: 'Current, as needed...' },
]

export function MedicationsView({ work, onUpdate }: CandidateViewProps) {
  const medications = work.medications
  const update = (id: string, patch: Partial<Medication>) =>
    onUpdate({ medications: updateById(medications, id, patch) })

  return (
    <>
      <PageHead
        title="Current medications"
        description="Enter medicine details as described in the fictional case. Any medicine name and regimen can be recorded."
        breadcrumb={['Cases', 'Patient record', 'Current medications']}
      />
      <article className="card">
        <div className="card-heading">
          <div>
            <span className="section-kicker">MEDICINE RECORD</span>
            <h3>Medication list</h3>
          </div>
          <button
            className="secondary-button"
            onClick={() => onUpdate({ medications: [...medications, newMedication()] })}
          >
            + Add medication
          </button>
        </div>
        <p className="muted">
          Use generic or brand names as appropriate. Record dose, route, frequency, indication, and
          status; this demo does not check whether a regimen is clinically correct.
        </p>
        {medications.length === 0 && <p className="empty-inline">No medicines entered yet.</p>}
        {medications.map((item, index) => (
          <RepeatCard
            key={item.id}
            title={`Medication ${index + 1}`}
            onRemove={() => onUpdate({ medications: removeById(medications, item.id) })}
          >
            <div className="form-grid">
              {textFields.map((field) => (
                <label key={field.key}>
                  {field.label}
                  <input
                    value={item[field.key]}
                    onChange={(e) => update(item.id, { [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                  />
                </label>
              ))}
              <label className="wide">
                Notes
                <textarea
                  className="short-textarea"
                  value={item.notes}
                  onChange={(e) => update(item.id, { notes: e.target.value })}
                />
              </label>
            </div>
          </RepeatCard>
        ))}
      </article>
    </>
  )
}
