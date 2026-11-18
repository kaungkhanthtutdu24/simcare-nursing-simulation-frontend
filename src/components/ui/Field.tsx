import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

interface FieldBase {
  id: string
  label: string
  hint?: ReactNode
  error?: string | null
  required?: boolean
}

interface FieldProps extends FieldBase {
  children: (control: {
    id: string
    'aria-describedby'?: string
    'aria-invalid'?: true
    required?: boolean
  }) => ReactNode
}

/**
 * Label, hint and error wiring shared by every form control. The control is
 * described by its hint and error, and marked invalid when there is an error.
 */
export function Field({ id, label, hint, error, required, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`ui-field ${error ? 'has-error' : ''}`}>
      <label className="ui-label" htmlFor={id}>
        {label}
        {required && <span className="ui-required"> (required)</span>}
      </label>
      {hint && (
        <p className="ui-hint" id={hintId}>
          {hint}
        </p>
      )}
      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        required,
      })}
      {error && (
        <p className="ui-error" id={errorId}>
          <span className="visually-hidden">Error:</span> {error}
        </p>
      )}
    </div>
  )
}

type TextFieldProps = FieldBase & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'required'>

export function TextField({
  id,
  label,
  hint,
  error,
  required,
  className,
  ...input
}: TextFieldProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required}>
      {(control) => <input className={`ui-input ${className ?? ''}`} {...input} {...control} />}
    </Field>
  )
}

export interface SelectOption {
  value: string
  label: string
}

type SelectFieldProps = FieldBase & {
  options: SelectOption[]
  placeholder: string
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'required'>

export function SelectField({
  id,
  label,
  hint,
  error,
  required,
  options,
  placeholder,
  className,
  ...select
}: SelectFieldProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required}>
      {(control) => (
        <select className={`ui-select ${className ?? ''}`} {...select} {...control}>
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  )
}
