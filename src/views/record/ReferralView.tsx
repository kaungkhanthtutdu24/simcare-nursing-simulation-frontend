import type { Referral } from '../../model'
import { PageHead } from '../../components/PageHead'
import type { CandidateViewProps } from '../types'

type ReferralTextKey = Exclude<keyof Referral, 'submitted'>

const longFields: { key: ReferralTextKey; label: string; placeholder?: string }[] = [
  {
    key: 'clinicalQuestion',
    label: 'Clinical question',
    placeholder: 'What do you need the receiving clinician to assess or answer?',
  },
  { key: 'relevantHistory', label: 'Relevant history and current medicines' },
  { key: 'investigations', label: 'Findings and investigations' },
  { key: 'requestedAction', label: 'Requested action and follow-up' },
]

export function ReferralView({ work, onUpdate, onNotice }: CandidateViewProps) {
  const referral = work.referral
  const { submitted } = referral
  const update = (patch: Partial<Referral>) => onUpdate({ referral: { ...referral, ...patch } })
  const canSubmit = referral.recipient.trim() !== '' && referral.clinicalQuestion.trim() !== ''

  return (
    <>
      <PageHead
        title="Referral"
        description="Write a referral that gives the recipient context and a clear clinical question."
        breadcrumb={['Cases', 'Patient record', 'Referral']}
      />
      <article className="card form-card">
        <div className="card-heading">
          <div>
            <span className="section-kicker">REFERRAL PROFORMA</span>
            <h3>Referral draft</h3>
          </div>
          <span className="soft-pill">{submitted ? 'Submitted' : 'Draft'}</span>
        </div>
        <div className="form-grid">
          <label>
            Refer to
            <input
              value={referral.recipient}
              readOnly={submitted}
              onChange={(e) => update({ recipient: e.target.value })}
              placeholder="Service or specialty"
            />
          </label>
          <label>
            Reason or priority
            <input
              value={referral.reason}
              readOnly={submitted}
              onChange={(e) => update({ reason: e.target.value })}
            />
          </label>
          {longFields.map((field) => (
            <label className="wide" key={field.key}>
              {field.label}
              <textarea
                value={referral[field.key]}
                readOnly={submitted}
                onChange={(e) => update({ [field.key]: e.target.value })}
                placeholder={field.placeholder}
              />
            </label>
          ))}
        </div>
        <div className="editor-footer">
          <span>Referral text stays in this simulation; it is not sent externally.</span>
          <div className="button-row">
            <button
              className="secondary-button"
              disabled={submitted}
              onClick={() => onNotice('Referral draft saved locally')}
            >
              Save draft
            </button>
            <button
              className="primary-button"
              disabled={submitted || !canSubmit}
              onClick={() => {
                update({ submitted: true })
                onNotice('Referral submitted for educator review')
              }}
            >
              Submit referral
            </button>
          </div>
        </div>
      </article>
    </>
  )
}
