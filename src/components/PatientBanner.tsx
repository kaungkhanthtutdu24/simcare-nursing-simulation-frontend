import type { PatientCase } from '../model'

export function PatientBanner({ patient }: { patient: PatientCase }) {
  return (
    <section className="patient-banner" aria-label="Current fictional patient">
      <div className="patient-identity">
        <div className="patient-avatar">AW</div>
        <div>
          <div className="eyebrow">CURRENT SIMULATION CASE</div>
          <h1>{patient.name}</h1>
          <p>
            {patient.id}
            <span className="divider">·</span>
            {patient.age} years
            <span className="divider">·</span>
            {patient.pronouns}
          </p>
        </div>
      </div>
      <div className="banner-field">
        <span>Scenario</span>
        <strong>{patient.scenario}</strong>
      </div>
      <div className="banner-field context">
        <span>Communication preference</span>
        <strong>{patient.context}</strong>
      </div>
      <div className="banner-state">
        <span className="case-status">
          <span className="status-dot" />
          {patient.published ? 'Case published' : 'Case draft'}
        </span>
        <span>Training environment</span>
      </div>
    </section>
  )
}
