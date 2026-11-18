import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { restoreSession } from '../../auth/localAccounts'
import { renderApp } from '../../test/renderApp'

async function openSignUp() {
  const app = renderApp('/signup')
  await screen.findByRole('heading', { name: 'Create an account' })
  return app
}

describe('student registration', () => {
  it('shows the student email error next to the field when it loses focus', async () => {
    const { user } = await openSignUp()
    const email = screen.getByLabelText(/Student email/)
    await user.type(email, 'aroha@gmail.com')
    await user.tab()
    expect(email).toHaveAccessibleDescription(
      expect.stringContaining('ending in @students.waikato.ac.nz'),
    )
    expect(email).toHaveAttribute('aria-invalid', 'true')
  })

  it('explains that the format check does not verify ownership', async () => {
    await openSignUp()
    expect(
      screen.getByText('We check the format only. This does not verify that you own the address.'),
    ).toBeInTheDocument()
  })

  it('disables year and course until their parent is chosen', async () => {
    const { user } = await openSignUp()
    const year = screen.getByRole('combobox', { name: /Year of study/ })
    const course = screen.getByRole('combobox', { name: /Course or paper/ })
    expect(year).toBeDisabled()
    expect(course).toBeDisabled()
    await user.selectOptions(screen.getByRole('combobox', { name: /Nursing programme/ }), 'bnurs')
    expect(year).toBeEnabled()
    expect(course).toBeDisabled()
  })

  it('lists only the papers for the chosen programme and year', async () => {
    const { user } = await openSignUp()
    await user.selectOptions(screen.getByRole('combobox', { name: /Nursing programme/ }), 'bnurs')
    await user.selectOptions(screen.getByRole('combobox', { name: /Year of study/ }), '2')
    const course = screen.getByRole('combobox', { name: /Course or paper/ })
    expect(
      within(course).getByRole('option', { name: 'NURSE204 — Pharmacology for Nurses' }),
    ).toBeInTheDocument()
    expect(within(course).queryByRole('option', { name: /NURSE101/ })).not.toBeInTheDocument()
    expect(screen.getByText(/provisional, pending supervisor approval/)).toBeInTheDocument()
  })

  it('resets year and course when the programme changes', async () => {
    const { user } = await openSignUp()
    const programme = screen.getByRole('combobox', { name: /Nursing programme/ })
    await user.selectOptions(programme, 'bnurs')
    await user.selectOptions(screen.getByRole('combobox', { name: /Year of study/ }), '3')
    await user.selectOptions(screen.getByRole('combobox', { name: /Course or paper/ }), 'NURSE303')
    await user.selectOptions(programme, 'mnursprac')
    expect(screen.getByRole('combobox', { name: /Year of study/ })).toHaveValue('')
    expect(screen.getByRole('combobox', { name: /Course or paper/ })).toHaveValue('')
  })

  it('lists every problem in a summary when submitted empty', async () => {
    const { user } = await openSignUp()
    await user.click(screen.getByRole('button', { name: /Create account/ }))
    const summary = screen.getByRole('alert')
    expect(within(summary).getAllByRole('link')).toHaveLength(7)
    expect(summary).toHaveFocus()
    expect(restoreSession()).toBeNull()
  })

  it('moves focus to the field when a summary link is chosen', async () => {
    const { user } = await openSignUp()
    await user.click(screen.getByRole('button', { name: /Create account/ }))
    const summary = screen.getByRole('alert')
    await user.click(within(summary).getByRole('link', { name: 'Choose your nursing programme.' }))
    expect(screen.getByRole('combobox', { name: /Nursing programme/ })).toHaveFocus()
  })

  it('focuses the nearest usable control when the linked field is disabled', async () => {
    const { user } = await openSignUp()
    await user.click(screen.getByRole('button', { name: /Create account/ }))
    const summary = screen.getByRole('alert')
    await user.click(within(summary).getByRole('link', { name: 'Choose a course or paper.' }))
    expect(screen.getByRole('combobox', { name: /Nursing programme/ })).toHaveFocus()
  })

  it('creates a student account and opens the student workspace', async () => {
    const { user, router } = await openSignUp()
    await user.type(screen.getByLabelText(/Full name/), 'Aroha Williams')
    await user.type(screen.getByLabelText(/Student ID/), '1686173')
    await user.type(screen.getByLabelText(/Student email/), ' Aroha.W@students.waikato.ac.nz ')
    await user.selectOptions(screen.getByRole('combobox', { name: /Nursing programme/ }), 'bnurs')
    await user.selectOptions(screen.getByRole('combobox', { name: /Year of study/ }), '2')
    await user.selectOptions(screen.getByRole('combobox', { name: /Course or paper/ }), 'NURSE204')
    await user.type(screen.getByLabelText(/^Password/), 'practice-pass')
    await user.type(screen.getByLabelText(/Confirm password/), 'practice-pass')
    await user.click(screen.getByRole('button', { name: /Create account/ }))

    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/candidate\//))
    expect(restoreSession()).toMatchObject({
      role: 'candidate',
      email: 'aroha.w@students.waikato.ac.nz',
      profile: { programme: 'bnurs', yearOfStudy: 2, paperCode: 'NURSE204' },
    })
  })
})

describe('educator demo registration', () => {
  it('accepts a staff email and does not ask for a programme', async () => {
    const { user, router } = await openSignUp()
    await user.click(screen.getByRole('radio', { name: /Educator/ }))
    expect(screen.queryByRole('combobox', { name: /Nursing programme/ })).not.toBeInTheDocument()
    await user.type(screen.getByLabelText(/Full name/), 'Lecturer One')
    await user.type(screen.getByLabelText(/^Email/), 'lecturer@waikato.ac.nz')
    await user.type(screen.getByLabelText(/Staff ID/), 'EDU-102')
    await user.type(screen.getByLabelText(/^Password/), 'practice-pass')
    await user.type(screen.getByLabelText(/Confirm password/), 'practice-pass')
    await user.click(screen.getByRole('button', { name: /Create account/ }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/educator/cases'))
  })
})

describe('accessibility', () => {
  it('has no axe violations on the sign-up page', async () => {
    await openSignUp()
    expect(await axe(document.body)).toHaveNoViolations()
  })

  it('has no axe violations on the sign-in page', async () => {
    renderApp('/login')
    await screen.findByRole('heading', { name: 'Sign in' })
    expect(await axe(document.body)).toHaveNoViolations()
  })
})
