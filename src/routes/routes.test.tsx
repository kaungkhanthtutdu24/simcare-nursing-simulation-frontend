import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { candidateInput, educatorInput, renderApp, seedAccount } from '../test/renderApp'

const record = '/candidate/cases/case-1/patients/SIM-1042'

const candidatePaths = [
  '/candidate/cases',
  '/candidate/cases/case-1',
  '/candidate/cases/case-1/background',
  '/candidate/cases/case-1/inbox',
  '/candidate/cases/case-1/feedback',
  `${record}/demographics`,
  `${record}/history`,
  `${record}/medications`,
  `${record}/clinical-notes`,
  `${record}/referral`,
  `${record}/vitals`,
]

const educatorPaths = [
  '/educator/cases',
  '/educator/cases/case-1/edit',
  '/educator/cases/case-1/release',
  '/educator/cases/case-1/review/candidate-01',
]

async function expectPageRenders(path: string) {
  renderApp(path)
  expect(await screen.findByRole('heading', { level: 2 })).toBeInTheDocument()
  expect(screen.queryByText('Page not found')).not.toBeInTheDocument()
  expect(screen.queryByText('Access not available')).not.toBeInTheDocument()
}

describe('existing routes', () => {
  it('redirects signed-out visitors to the sign-in page', async () => {
    renderApp('/candidate/cases')
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it.each(candidatePaths)('renders candidate route %s', async (path) => {
    await seedAccount(candidateInput)
    await expectPageRenders(path)
  })

  it.each(educatorPaths)('renders educator route %s', async (path) => {
    await seedAccount(educatorInput)
    await expectPageRenders(path)
  })

  it('shows access denied when a candidate opens an educator page', async () => {
    await seedAccount(candidateInput)
    renderApp('/educator/cases')
    expect(await screen.findByText('Access not available')).toBeInTheDocument()
  })

  it('shows not found for an unknown case', async () => {
    await seedAccount(candidateInput)
    renderApp('/candidate/cases/nope')
    expect(await screen.findByText('Page not found')).toBeInTheDocument()
  })
})
