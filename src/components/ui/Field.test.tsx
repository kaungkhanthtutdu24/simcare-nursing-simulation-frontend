import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { ErrorSummary } from './ErrorSummary'
import { SelectField, TextField } from './Field'

const options = [
  { value: 'bnurs', label: 'Bachelor of Nursing (BNurs)' },
  { value: 'mnursprac', label: 'Master of Nursing Practice (MNursPrac)' },
]

describe('TextField', () => {
  it('describes the input with its hint and error', () => {
    render(
      <TextField
        id="email"
        label="Student email"
        hint="Ends in @students.waikato.ac.nz"
        error="Use your student email."
        value=""
        onChange={() => {}}
      />,
    )
    const input = screen.getByLabelText(/Student email/)
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription(
      'Ends in @students.waikato.ac.nz Error: Use your student email.',
    )
  })

  it('is not marked invalid without an error', () => {
    render(<TextField id="name" label="Full name" value="" onChange={() => {}} />)
    expect(screen.getByLabelText('Full name')).not.toHaveAttribute('aria-invalid')
  })

  it('shows required in words, not only with a symbol', () => {
    render(<TextField id="name" label="Full name" required value="" onChange={() => {}} />)
    expect(screen.getByLabelText(/Full name/)).toBeRequired()
    expect(screen.getByText('(required)')).toBeInTheDocument()
  })
})

describe('SelectField', () => {
  it('renders an empty placeholder option and is labelled', () => {
    render(
      <SelectField
        id="programme"
        label="Nursing programme"
        placeholder="Choose a programme"
        options={options}
        value=""
        onChange={() => {}}
      />,
    )
    const select = screen.getByRole('combobox', { name: 'Nursing programme' })
    expect(select).toHaveValue('')
    expect(screen.getByRole('option', { name: 'Choose a programme' })).toHaveValue('')
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })
})

describe('ErrorSummary', () => {
  it('links to each field and takes focus', () => {
    render(
      <ErrorSummary
        errors={[
          { fieldId: 'email', message: 'Use your student email.' },
          { fieldId: 'programme', message: 'Choose your nursing programme.' },
        ]}
      />,
    )
    const summary = screen.getByRole('alert')
    expect(summary).toHaveFocus()
    expect(screen.getByRole('link', { name: 'Use your student email.' })).toHaveAttribute(
      'href',
      '#email',
    )
  })

  it('renders nothing when there are no errors', () => {
    const { container } = render(<ErrorSummary errors={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('accessibility', () => {
  it('has no axe violations for a small form', async () => {
    const { container } = render(
      <form>
        <ErrorSummary errors={[{ fieldId: 'email', message: 'Use your student email.' }]} />
        <TextField
          id="email"
          label="Student email"
          error="Use your student email."
          value=""
          onChange={() => {}}
        />
        <SelectField
          id="programme"
          label="Nursing programme"
          placeholder="Choose a programme"
          options={options}
          value=""
          onChange={() => {}}
        />
      </form>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
