import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { signOutDemoAccount } from '../../auth/localAccounts'
import { candidateInput, renderApp, seedAccount } from '../../test/renderApp'

/** Removes the profile from the stored account, as an account from before profiles existed. */
function makeLegacy() {
  const key = 'simcare-demo-accounts-v1'
  const accounts = JSON.parse(localStorage.getItem(key)!)
  delete accounts[0].profile
  localStorage.setItem(key, JSON.stringify(accounts))
}

describe('student dashboard', () => {
  it('is where /candidate goes', async () => {
    await seedAccount(candidateInput)
    const { router } = renderApp('/candidate')
    expect(await screen.findByRole('heading', { name: 'Kia ora, Aroha' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/candidate/dashboard')
  })

  it('is where a student lands after signing in', async () => {
    await seedAccount(candidateInput)
    signOutDemoAccount()
    const { user, router } = renderApp('/login')
    await user.type(await screen.findByLabelText(/Email address/), candidateInput.email)
    await user.type(screen.getByLabelText(/Password/), candidateInput.password)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/candidate/dashboard'))
  })

  it('shows the programme summary and progress for fresh work', async () => {
    await seedAccount(candidateInput)
    renderApp('/candidate/dashboard')
    expect(await screen.findByText('BNurs · Year 2 · NURSE204')).toBeInTheDocument()
    expect(screen.getByText('1 of 6 complete')).toBeInTheDocument()
    const active = screen.getByRole('region', { name: 'Active case' })
    expect(within(active).getByText('Aroha Williams')).toBeInTheDocument()
    expect(
      within(active).getByRole('link', { name: /Write your consultation note/ }),
    ).toHaveAttribute('href', '/candidate/cases/case-1/patients/SIM-1042/clinical-notes')
  })

  it('does not count the patient record as done when no case is published', async () => {
    await seedAccount(candidateInput)
    localStorage.setItem('simcare-react-demo-v1', JSON.stringify({ patient: { published: false } }))
    renderApp('/candidate/dashboard')
    const active = await screen.findByRole('region', { name: 'Active case' })
    expect(within(active).getByText('No published cases yet')).toBeInTheDocument()
    expect(screen.getByText('0 of 6 complete')).toBeInTheDocument()
  })

  it('shows an empty feedback state until feedback is released', async () => {
    await seedAccount(candidateInput)
    renderApp('/candidate/dashboard')
    const feedback = await screen.findByRole('region', { name: 'Latest feedback' })
    expect(within(feedback).getByText('No feedback released yet')).toBeInTheDocument()
  })

  it('asks a student without a profile to complete it', async () => {
    await seedAccount(candidateInput)
    makeLegacy()
    renderApp('/candidate/dashboard')
    expect(await screen.findByRole('link', { name: 'Complete your profile' })).toHaveAttribute(
      'href',
      '/candidate/profile',
    )
  })

  it('has no axe violations', async () => {
    await seedAccount(candidateInput)
    renderApp('/candidate/dashboard')
    await screen.findByRole('heading', { name: 'Kia ora, Aroha' })
    // The page content; the app shell is checked in Sidebar.test.tsx.
    expect(await axe(document.getElementById('main-panel')!)).toHaveNoViolations()
  })
})
