import type { FamilyHistory, MedicalCondition } from '../../model'
import { newCondition, newFamilyHistory } from '../../model'
import { PageHead } from '../../components/PageHead'
import { RepeatCard } from '../../components/RepeatCard'
import { removeById, updateById } from '../types'
import type { CandidateViewProps } from '../types'

export function HistoryView({ work, onUpdate }: CandidateViewProps) {
  const { conditions, familyHistory } = work
  const updateCondition = (id: string, patch: Partial<MedicalCondition>) =>
    onUpdate({ conditions: updateById(conditions, id, patch) })
  const updateFamily = (id: string, patch: Partial<FamilyHistory>) =>
    onUpdate({ familyHistory: updateById(familyHistory, id, patch) })

  return (
    <>
      <PageHead
        title="Medical and family history"
        description="Record any relevant condition or classification and family history in free text."
        breadcrumb={['Cases', 'Patient record', 'Medical and family history']}
      />

      <article className="card">
        <div className="card-heading">
          <div>
            <span className="section-kicker">PATIENT HISTORY</span>
            <h3>Medical conditions</h3>
          </div>
          <button
            className="secondary-button"
            onClick={() => onUpdate({ conditions: [...conditions, newCondition()] })}
          >
            + Add condition
          </button>
        </div>
        <p className="muted">
          Examples include type 2 diabetes and hypertension. Enter any relevant condition; examples
          are not a complete catalogue.
        </p>
        {conditions.length === 0 && <p className="empty-inline">No conditions entered yet.</p>}
        {conditions.map((item, index) => (
          <RepeatCard
            key={item.id}
            title={`Condition ${index + 1}`}
            onRemove={() => onUpdate({ conditions: removeById(conditions, item.id) })}
          >
            <div className="form-grid">
              <label>
                Condition or diagnosis
                <input
                  value={item.condition}
                  onChange={(e) => updateCondition(item.id, { condition: e.target.value })}
                  placeholder="Any condition"
                />
              </label>
              <label>
                Classification or code if known
                <input
                  value={item.classification}
                  onChange={(e) => updateCondition(item.id, { classification: e.target.value })}
                  placeholder="Optional"
                />
              </label>
              <label>
                Onset or date noted
                <input
                  value={item.onset}
                  onChange={(e) => updateCondition(item.id, { onset: e.target.value })}
                  placeholder="Optional"
                />
              </label>
              <label>
                Status
                <input
                  value={item.status}
                  onChange={(e) => updateCondition(item.id, { status: e.target.value })}
                  placeholder="Active, resolved, unknown..."
                />
              </label>
              <label className="wide">
                Notes
                <textarea
                  className="short-textarea"
                  value={item.notes}
                  onChange={(e) => updateCondition(item.id, { notes: e.target.value })}
                />
              </label>
            </div>
          </RepeatCard>
        ))}
      </article>

      <article className="card">
        <div className="card-heading">
          <div>
            <span className="section-kicker">RELATED HISTORY</span>
            <h3>Family history</h3>
          </div>
          <button
            className="secondary-button"
            onClick={() => onUpdate({ familyHistory: [...familyHistory, newFamilyHistory()] })}
          >
            + Add family history
          </button>
        </div>
        {familyHistory.length === 0 && (
          <p className="empty-inline">No family history entered yet.</p>
        )}
        {familyHistory.map((item, index) => (
          <RepeatCard
            key={item.id}
            title={`Family history ${index + 1}`}
            onRemove={() => onUpdate({ familyHistory: removeById(familyHistory, item.id) })}
          >
            <div className="form-grid">
              <label>
                Relationship
                <input
                  value={item.relationship}
                  onChange={(e) => updateFamily(item.id, { relationship: e.target.value })}
                  placeholder="e.g. parent, sibling"
                />
              </label>
              <label>
                Condition or relevant history
                <input
                  value={item.condition}
                  onChange={(e) => updateFamily(item.id, { condition: e.target.value })}
                />
              </label>
              <label className="wide">
                Additional detail
                <textarea
                  className="short-textarea"
                  value={item.notes}
                  onChange={(e) => updateFamily(item.id, { notes: e.target.value })}
                />
              </label>
            </div>
          </RepeatCard>
        ))}
      </article>
    </>
  )
}
