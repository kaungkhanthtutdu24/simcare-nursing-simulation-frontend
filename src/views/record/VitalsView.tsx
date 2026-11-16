import type { VitalSigns } from '../../model'
import { newVitalSigns } from '../../model'
import { PageHead } from '../../components/PageHead'
import { RepeatCard } from '../../components/RepeatCard'
import { removeById, updateById } from '../types'
import type { CandidateViewProps } from '../types'

const measurementFields: { key: keyof VitalSigns; label: string; min?: string; step?: string }[] = [
  { key: 'systolic', label: 'Systolic BP (mmHg)', min: '0' },
  { key: 'diastolic', label: 'Diastolic BP (mmHg)', min: '0' },
  { key: 'weight', label: 'Weight (kg)', min: '0', step: '0.1' },
  { key: 'heartRate', label: 'Heart rate (bpm)', min: '0' },
  { key: 'temperature', label: 'Temperature (°C)', step: '0.1' },
]

/** Weight change between the earliest and latest dated entries, or null if fewer than two. */
function weightChange(ordered: VitalSigns[]): number | null {
  const weights = ordered
    .map((item) => Number(item.weight))
    .filter((value) => Number.isFinite(value) && value > 0)
  return weights.length > 1 ? weights[weights.length - 1] - weights[0] : null
}

export function VitalsView({ work, onUpdate }: CandidateViewProps) {
  const vitals = work.vitals
  const ordered = vitals.filter((item) => item.date).sort((a, b) => a.date.localeCompare(b.date))
  const delta = weightChange(ordered)
  const update = (id: string, patch: Partial<VitalSigns>) =>
    onUpdate({ vitals: updateById(vitals, id, patch) })

  return (
    <>
      <PageHead
        title="Vital signs"
        description="Record dated measurements at each review and compare them over time."
        breadcrumb={['Cases', 'Patient record', 'Vital signs']}
      />
      <article className="card">
        <div className="card-heading">
          <div>
            <span className="section-kicker">OBSERVATIONS</span>
            <h3>Review measurements</h3>
          </div>
          <button
            className="secondary-button"
            onClick={() => onUpdate({ vitals: [...vitals, newVitalSigns()] })}
          >
            + Add review
          </button>
        </div>
        <p className="muted">
          Use the date of each review. Weight change is calculated from the earliest and latest
          recorded weights.
        </p>

        {delta !== null && (
          <div className="trend-callout">
            <strong>Weight trend</strong>
            <span>
              {delta > 0 ? '+' : ''}
              {delta.toFixed(1)} kg between first and latest entries
            </span>
          </div>
        )}

        {vitals.length === 0 && <p className="empty-inline">No measurements entered yet.</p>}
        {vitals.map((item, index) => (
          <RepeatCard
            key={item.id}
            title={`Review ${index + 1}`}
            onRemove={() => onUpdate({ vitals: removeById(vitals, item.id) })}
          >
            <div className="vital-grid">
              <label>
                Date
                <input
                  type="date"
                  value={item.date}
                  onChange={(e) => update(item.id, { date: e.target.value })}
                />
              </label>
              {measurementFields.map((field) => (
                <label key={field.key}>
                  {field.label}
                  <input
                    type="number"
                    min={field.min}
                    step={field.step}
                    value={item[field.key]}
                    onChange={(e) => update(item.id, { [field.key]: e.target.value })}
                  />
                </label>
              ))}
            </div>
          </RepeatCard>
        ))}

        {ordered.length > 0 && (
          <div className="table-scroll">
            <table className="vitals-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>BP</th>
                  <th>Weight</th>
                  <th>Heart rate</th>
                  <th>Temperature</th>
                </tr>
              </thead>
              <tbody>
                {ordered.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>
                      {item.systolic && item.diastolic
                        ? `${item.systolic}/${item.diastolic} mmHg`
                        : '—'}
                    </td>
                    <td>{item.weight ? `${item.weight} kg` : '—'}</td>
                    <td>{item.heartRate ? `${item.heartRate} bpm` : '—'}</td>
                    <td>{item.temperature ? `${item.temperature} °C` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </>
  )
}
