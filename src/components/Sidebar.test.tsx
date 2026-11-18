import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { candidateInput, educatorInput, renderApp, seedAccount } from '../test/renderApp'

const record = '/candidate/cases/case-1/patients/SIM-1042'

async function openAs(input: typeof candidateInput, path: string) {
  await seedAccount(input)
  const app = renderApp(path)
  await screen.findByRole('navigation', { name: 'Main navigation' })
  return app
}

describe('candidate navigation', () => {
  it('groups links under My learning and Patient record', async () => {
    await openAs(candidateInput, `${record}/history`)
    const learning = screen.getByRole('list', { name: 'My learning' })
    expect(
      within(learning)
        .getAllByRole('link')
        .map((a) => a.textContent),
    ).toEqual(['Dashboard', 'Profile', 'My cases', 'Feedback'])
    const recordList = screen.getByRole('list', { name: 'Patient record' })
    expect(
      within(recordList)
        .getAllByRole('link')
        .map((a) => a.textContent),
    ).toEqual([
      'Overview',
      'Demographics',
      'Medical history',
      'Medications',
      'Clinical notes',
      expect.stringContaining('Clinical inbox'),
      'Referral',
      'Vital signs',
    ])
  })

  it('marks the current page', async () => {
    await openAs(candidateInput, `${record}/history`)
    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(within(nav).getByRole('link', { name: 'Medical history' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(within(nav).getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current')
  })

  it('announces unread inbox items in the link name', async () => {
    await openAs(candidateInput, '/candidate/dashboard')
    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(within(nav).getByRole('link', { name: /Clinical inbox.*1 unread/ })).toBeInTheDocument()
  })

  it('links to the profile from the account area', async () => {
    await openAs(candidateInput, '/candidate/dashboard')
    const banner = screen.getByRole('banner')
    expect(within(banner).getByRole('link', { name: /Profile/ })).toHaveAttribute(
      'href',
      '/candidate/profile',
    )
    expect(within(banner).getByRole('button', { name: /Sign out/ })).toBeInTheDocument()
  })
})

describe('mobile menu', () => {
  it('opens and closes with the menu button and Escape', async () => {
    const { user } = await openAs(candidateInput, '/candidate/dashboard')
    const button = screen.getByRole('button', { name: 'Menu' })
    expect(button).toHaveAttribute('aria-controls', 'app-sidebar')
    expect(button).toHaveAttribute('aria-expanded', 'false')

    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveFocus()
  })

  it('closes after choosing a page', async () => {
    const { user, router } = await openAs(candidateInput, '/candidate/dashboard')
    const button = screen.getByRole('button', { name: 'Menu' })
    await user.click(button)
    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    await user.click(within(nav).getByRole('link', { name: 'Profile' }))
    expect(router.state.location.pathname).toBe('/candidate/profile')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('shell', () => {
  it('has a skip link to the main content', async () => {
    await openAs(candidateInput, '/candidate/dashboard')
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute(
      'href',
      '#main-panel',
    )
  })

  it('keeps the educator navigation items', async () => {
    await openAs(educatorInput, '/educator/cases')
    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(
      within(nav)
        .getAllByRole('link')
        .map((a) => a.textContent),
    ).toEqual(['Cases', 'Case editor', 'Event release', 'Candidate review'])
  })

  it('has no axe violations on the student dashboard', async () => {
    await openAs(candidateInput, '/candidate/dashboard')
    expect(await axe(document.body)).toHaveNoViolations()
  })

  it('has no axe violations on the educator case list', async () => {
    await openAs(educatorInput, '/educator/cases')
    expect(await axe(document.body)).toHaveNoViolations()
  })
})
