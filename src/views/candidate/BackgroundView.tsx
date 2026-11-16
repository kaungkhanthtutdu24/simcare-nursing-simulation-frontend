import type { PatientCase } from '../../model'
import { PageHead } from '../../components/PageHead'

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="snapshot-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export function BackgroundView({ patient }: { patient: PatientCase }) {
  return (
    <>
      <PageHead
        title="Patient background"
        description="Fictional case context for this learning activity."
        breadcrumb={['Cases', patient.name, 'Background']}
      />
      <div className="two-col">
        <article className="card">
          <span className="section-kicker">IDENTITY</span>
          <h3>{patient.name}</h3>
          <SnapshotRow label="Simulation ID" value={patient.id} />
          <SnapshotRow label="Age" value={`${patient.age} years`} />
          <SnapshotRow label="Pronouns" value={patient.pronouns} />
        </article>
        <article className="card">
          <span className="section-kicker">CARE CONTEXT</span>
          <h3>History and preferences</h3>
          <SnapshotRow label="Past history" value={patient.history} />
          <SnapshotRow label="Current medicines" value={patient.medicines} />
          <SnapshotRow label="Communication" value={patient.context} />
        </article>
      </div>
    </>
  )
}
