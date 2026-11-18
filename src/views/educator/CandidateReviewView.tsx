import type { CandidateId, CandidateWork, VitalSigns } from '../../model'
import { candidateDisplayName } from '../../auth/localAccounts'
import { PageHead } from '../../components/PageHead'
import type { EducatorViewProps } from './types'

function SnapshotRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="snapshot-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

/** The submitted note text, or the SOAP fields if the note hasn't been compiled yet. */
function consultationText(work: CandidateWork): string {
  if (work.note) return work.note
  const { soap } = work
  if (!Object.values(soap).some(Boolean)) return 'No consultation note entered yet.'
  return [
    `Subjective: ${soap.subjective}`,
    `Objective: ${soap.objective}`,
    `Assessment: ${soap.assessment}`,
    `Plan: ${soap.plan}`,
  ].join('\n')
}

function referralText(work: CandidateWork): string {
  const { referral } = work
  if (!referral.recipient) return 'No referral entered yet.'
  return [
    referral.recipient,
    `Clinical question: ${referral.clinicalQuestion}`,
    `Relevant history: ${referral.relevantHistory}`,
    `Findings: ${referral.investigations}`,
  ].join('\n')
}

function vitalsSummary(v: VitalSigns): string {
  return [
    v.systolic && v.diastolic ? `${v.systolic}/${v.diastolic} mmHg · ` : '',
    v.weight ? `${v.weight} kg · ` : '',
    v.heartRate ? `${v.heartRate} bpm · ` : '',
    v.temperature ? `${v.temperature} °C` : '',
  ].join('')
}

export function CandidateReviewView({
  candidates,
  selectedCandidate,
  onCandidateChange,
  onCandidateUpdate,
  onNotice,
}: EducatorViewProps) {
  const work = candidates[selectedCandidate]
  const name = candidateDisplayName(selectedCandidate)
  const { demographics } = work

  const conditions = work.conditions
    .map((x) => x.condition)
    .filter(Boolean)
    .join(', ')
  const familyHistory = work.familyHistory
    .map((x) => `${x.relationship}: ${x.condition}`)
    .filter(Boolean)
    .join('; ')
  const medications = work.medications
    .map((x) => [x.name, x.dose, x.route, x.frequency].filter(Boolean).join(' '))
    .filter(Boolean)
    .join('; ')

  return (
    <>
      <PageHead
        title="Candidate review"
        description="Review an individual response and write formative feedback."
        breadcrumb={['Educator', 'Candidate review']}
        action={
          <label className="candidate-select">
            Candidate
            <select
              value={selectedCandidate}
              onChange={(e) => onCandidateChange(e.target.value as CandidateId)}
            >
              {(Object.keys(candidates) as CandidateId[]).map((id) => (
                <option key={id} value={id}>
                  {candidateDisplayName(id)}
                </option>
              ))}
            </select>
          </label>
        }
      />

      <div className="two-col">
        <article className="card">
          <span className="section-kicker">CONSULTATION</span>
          <h3>{work.noteSubmitted ? 'Submitted SOAP note' : 'Draft SOAP note'}</h3>
          <p className="review-text">{consultationText(work)}</p>
        </article>
        <article className="card">
          <span className="section-kicker">RELEASED EVENT RESPONSE</span>
          <h3>
            {work.responseSubmitted
              ? 'Submitted response'
              : work.inboxOpened
                ? 'Item opened'
                : 'Item unread'}
          </h3>
          <p className="review-text">{work.response || 'No response entered yet.'}</p>
          <small className="muted">
            Read status: {work.inboxOpened ? 'opened' : 'unread'} · Response status:{' '}
            {work.responseSubmitted ? 'submitted' : 'pending'}
          </small>
        </article>
      </div>

      <div className="two-col">
        <article className="card">
          <span className="section-kicker">PATIENT RECORD</span>
          <h3>Candidate entries</h3>
          <SnapshotRow
            label="Demographics"
            value={`${demographics.name || 'Not entered'} · ${demographics.dateOfBirth || 'DOB missing'}`}
          />
          <SnapshotRow label="Address" value={demographics.address || 'Not entered'} />
          <SnapshotRow label="Ethnicity" value={demographics.ethnicities || 'Not entered'} />
          <SnapshotRow label="Medical conditions" value={conditions || 'None entered'} />
          <SnapshotRow label="Family history" value={familyHistory || 'None entered'} />
          <SnapshotRow label="Current medications" value={medications || 'None entered'} />
        </article>
        <article className="card">
          <span className="section-kicker">REFERRAL AND OBSERVATIONS</span>
          <h3>{work.referral.submitted ? 'Referral submitted' : 'Referral draft'}</h3>
          <p className="review-text">{referralText(work)}</p>
          <SnapshotRow label="Vital sign reviews" value={work.vitals.length} />
          {work.vitals.map((v) => (
            <div className="snapshot-row" key={v.id}>
              <span>{v.date || 'Undated'}</span>
              <strong>{vitalsSummary(v)}</strong>
            </div>
          ))}
        </article>
      </div>

      <article className="card editor-card">
        <span className="section-kicker">FORMATIVE FEEDBACK</span>
        <h3>Feedback for {name}</h3>
        <label className="input-label" htmlFor="educator-feedback">
          Comments
        </label>
        <textarea
          id="educator-feedback"
          value={work.feedback}
          onChange={(e) => onCandidateUpdate({ feedback: e.target.value, feedbackReleased: false })}
          placeholder="What was done well? What should the candidate consider next?"
        />
        <div className="editor-footer">
          <span>
            {work.feedbackReleased
              ? 'Visible to this candidate.'
              : 'Only educators can see this draft.'}
          </span>
          <div className="button-row">
            <button
              className="secondary-button"
              onClick={() => onNotice('Feedback draft saved locally')}
            >
              Save draft
            </button>
            <button
              className="primary-button"
              disabled={!work.feedback.trim() || work.feedbackReleased}
              onClick={() => {
                onCandidateUpdate({ feedbackReleased: true })
                onNotice(`Feedback released to ${name}`)
              }}
            >
              Release feedback
            </button>
          </div>
        </div>
      </article>
    </>
  )
}
