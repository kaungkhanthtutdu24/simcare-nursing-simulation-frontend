import { TriangleExclamationPoint } from 'lucide-react'
import { SelectField } from '../components/ui/Field'
import { isProvisional, papersFor, programmes, yearsFor } from './programmes'
import { nextSelection } from './selection'
import type { ProgrammeSelection } from './selection'
import type { StudentProfileErrors } from './validation'

const programmeOptions = programmes.map((p) => ({
  value: p.id,
  label: `${p.name} (${p.abbreviation})`,
}))

export function ProgrammeFields({
  idPrefix,
  value,
  errors,
  onChange,
  onBlurField,
}: {
  idPrefix: string
  value: ProgrammeSelection
  errors: StudentProfileErrors
  onChange: (value: ProgrammeSelection) => void
  onBlurField: (field: keyof ProgrammeSelection) => void
}) {
  const yearOptions = yearsFor(value.programme).map((y) => ({
    value: String(y.year),
    label: y.label,
  }))
  const paperOptions = papersFor(value.programme, value.yearOfStudy).map((p) => ({
    value: p.code,
    label: `${p.code} — ${p.title}`,
  }))
  const update = (change: Partial<ProgrammeSelection>) => onChange(nextSelection(value, change))

  return (
    <>
      <SelectField
        id={`${idPrefix}-programme`}
        label="Nursing programme"
        placeholder="Choose a programme"
        required
        options={programmeOptions}
        value={value.programme}
        error={errors.programme}
        onChange={(e) => update({ programme: e.target.value })}
        onBlur={() => onBlurField('programme')}
      />
      <SelectField
        id={`${idPrefix}-year`}
        label="Year of study"
        placeholder={value.programme ? 'Choose a year' : 'Choose a programme first'}
        required
        disabled={!value.programme}
        options={yearOptions}
        value={value.yearOfStudy}
        error={errors.yearOfStudy}
        onChange={(e) => update({ yearOfStudy: e.target.value })}
        onBlur={() => onBlurField('yearOfStudy')}
      />
      <SelectField
        id={`${idPrefix}-paper`}
        label="Course or paper"
        placeholder={value.yearOfStudy ? 'Choose a course or paper' : 'Choose a year first'}
        required
        disabled={!value.yearOfStudy}
        options={paperOptions}
        value={value.paperCode}
        error={errors.paperCode}
        onChange={(e) => update({ paperCode: e.target.value })}
        onBlur={() => onBlurField('paperCode')}
      />
      {isProvisional(value.programme, value.yearOfStudy) && (
        <p className="ui-note">
          <TriangleExclamationPoint aria-hidden="true" size={16} />
          <span>
            Course list for this year is provisional, pending supervisor approval. Paper codes and
            titles come from the University of Waikato website.
          </span>
        </p>
      )}
    </>
  )
}
