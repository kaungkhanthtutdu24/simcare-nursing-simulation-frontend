import { useEffect, useRef } from 'react'
import type { MouseEvent } from 'react'

export interface FieldError {
  fieldId: string
  message: string
}

/**
 * Lists form errors at the top of a form, with links to each field. It takes
 * focus when it appears so keyboard and screen-reader users hear the problems.
 */
export function ErrorSummary({
  errors,
  title = 'Please fix the following',
}: {
  errors: FieldError[]
  title?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const count = errors.length

  useEffect(() => {
    if (count > 0) ref.current?.focus()
  }, [count, errors])

  if (count === 0) return null

  /**
   * Fragment links do not move keyboard focus, and disabled fields cannot take
   * it. Focus the field, or the nearest earlier control the user can change.
   */
  function focusField(event: MouseEvent<HTMLAnchorElement>, fieldId: string) {
    const field = document.getElementById(fieldId) as HTMLInputElement | HTMLSelectElement | null
    if (!field) return
    event.preventDefault()
    let target: HTMLElement = field
    if (field.disabled && field.form) {
      const controls = Array.from(field.form.elements) as HTMLInputElement[]
      const before = controls.slice(0, controls.indexOf(field as HTMLInputElement))
      target = before.reverse().find((c) => !c.disabled && c.type !== 'radio') ?? field
    }
    target.focus()
  }
  return (
    <div className="error-summary" role="alert" tabIndex={-1} ref={ref}>
      <h3>{title}</h3>
      <ul>
        {errors.map((error) => (
          <li key={error.fieldId}>
            <a href={`#${error.fieldId}`} onClick={(e) => focusField(e, error.fieldId)}>
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
