import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { restoreSession } from '../../auth/localAccounts'
import { candidateInput, educatorInput, renderApp, seedAccount } from '../../test/renderApp'

async function openProfile() {
  await seedAccount(candidateInput)
  const app = renderApp('/candidate/profile')
  await screen.findByRole('heading', { name: 'Student profile' })
  return app
}

describe('student profile', () => {
  it('shows identity details as read-only and has no role control', async () => {
    await openProfile()
    expect(screen.getByLabelText('Student ID')).toHaveAttribute('readonly')
    expect(screen.getByLabelText('Student ID')).toHaveValue('1686173')
    expect(screen.getByLabelText('Student email')).toHaveAttribute('readonly')
    expect(screen.queryByLabelText(/role/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  })

  it('starts with the saved programme selections', async () => {
    await openProfile()
    expect(screen.getByRole('combobox', { name: /Nursing programme/ })).toHaveValue('bnurs')
    expect(screen.getByRole('combobox', { name: /Year of study/ })).toHaveValue('2')
    expect(screen.getByRole('combobox', { name: /Course or paper/ })).toHaveValue('NURSE204')
  })

  it('saves a new programme and shows it on the dashboard', async () => {
    const { user, router } = await openProfile()
    await user.selectOptions(
      screen.getByRole('combobox', { name: /Nursing programme/ }),
      'mnursprac',
    )
    await user.selectOptions(screen.getByRole('combobox', { name: /Year of study/ }), '1')
    await user.selectOptions(screen.getByRole('combobox', { name: /Course or paper/ }), 'NURSE579')
    await user.click(screen.getByRole('button', { name: 'Save profile' }))

    expect(await screen.findByText('Profile saved.')).toBeInTheDocument()
    expect(restoreSession()?.profile).toEqual({
      programme: 'mnursprac',
      yearOfStudy: 1,
      paperCode: 'NURSE579',
    })
    await router.navigate('/candidate/dashboard')
    expect(await screen.findByText('MNursPrac · Year 1 · NURSE579')).toBeInTheDocument()
  })

  it('blocks saving when the course was reset by a programme change', async () => {
    const { user } = await openProfile()
    await user.selectOptions(
      screen.getByRole('combobox', { name: /Nursing programme/ }),
      'mnursprac',
    )
    await user.click(screen.getByRole('button', { name: 'Save profile' }))
    expect(screen.getByRole('combobox', { name: /Year of study/ })).toHaveValue('2')
    expect(screen.getByRole('alert')).toHaveTextContent('Choose a course or paper.')
    expect(restoreSession()?.profile?.programme).toBe('bnurs')
  })

  it('prompts an account created before profiles existed to complete it', async () => {
    await seedAccount(candidateInput)
    const key = 'simcare-demo-accounts-v1'
    const accounts = JSON.parse(localStorage.getItem(key)!)
    delete accounts[0].profile
    accounts[0].email = 'old@gmail.com'
    localStorage.setItem(key, JSON.stringify(accounts))
    renderApp('/candidate/profile')
    await screen.findByRole('heading', { name: 'Student profile' })
    expect(screen.getByText(/Programme details: Not set/)).toBeInTheDocument()
    expect(screen.getByLabelText('Student email')).toHaveAccessibleDescription(
      expect.stringContaining('created before student emails were required'),
    )
  })

  it('says profile data is demo-only', async () => {
    await openProfile()
    expect(screen.getByText(/stored only in this browser/)).toBeInTheDocument()
  })

  it('is not available to educators', async () => {
    await seedAccount(educatorInput)
    renderApp('/candidate/profile')
    expect(await screen.findByText('Access not available')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    await openProfile()
    // The page content; the app shell is checked in Sidebar.test.tsx.
    await waitFor(async () =>
      expect(await axe(document.getElementById('main-panel')!)).toHaveNoViolations(),
    )
  })
})
