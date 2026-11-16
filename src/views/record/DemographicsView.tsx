import type { Demographics } from '../../model'
import { PageHead } from '../../components/PageHead'
import type { CandidateViewProps } from '../types'

export function DemographicsView({ work, onUpdate, onNotice }: CandidateViewProps) {
  const demographics = work.demographics
  const update = (patch: Partial<Demographics>) =>
    onUpdate({ demographics: { ...demographics, ...patch } })

  return (
    <>
      <PageHead
        title="Demographics"
        description="Enter the fictional patient’s identifying details and self-described ethnicity."
        breadcrumb={['Cases', 'Patient record', 'Demographics']}
      />
      <article className="card form-card">
        <div className="form-grid">
          <label>
            Full name
            <input value={demographics.name} onChange={(e) => update({ name: e.target.value })} />
          </label>
          <label>
            Date of birth
            <input
              type="date"
              value={demographics.dateOfBirth}
              onChange={(e) => update({ dateOfBirth: e.target.value })}
            />
          </label>
          <label className="wide">
            Address
            <textarea
              className="short-textarea"
              value={demographics.address}
              onChange={(e) => update({ address: e.target.value })}
              placeholder="Fictional address only"
            />
          </label>
          <label className="wide">
            Ethnicity or ethnicities
            <textarea
              className="short-textarea"
              value={demographics.ethnicities}
              onChange={(e) => update({ ethnicities: e.target.value })}
              placeholder="Enter the patient’s own description; multiple ethnicities can be recorded"
            />
          </label>
        </div>
        <p className="field-help">
          This field accepts any self-described ethnicity. It does not impose a fixed or complete
          worldwide list.
        </p>
        <div className="editor-footer">
          <span>Changes save automatically in this browser.</span>
          <button
            className="secondary-button"
            onClick={() => onNotice('Demographics saved locally')}
          >
            Save
          </button>
        </div>
      </article>
    </>
  )
}
