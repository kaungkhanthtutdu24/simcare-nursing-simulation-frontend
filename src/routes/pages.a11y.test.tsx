import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { candidateInput, educatorInput, renderApp, seedAccount } from '../test/renderApp'

const record = '/candidate/cases/case-1/patients/SIM-1042'

describe('page header', () => {
  it('renders the breadcrumb as a labelled list', async () => {
    await seedAccount(candidateInput)
    renderApp(`${record}/history`)
    const breadcrumb = await screen.findByRole('navigation', { name: 'Breadcrumb' })
    expect(
      within(breadcrumb)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual(['Cases', 'Patient record', 'Medical and family history'])
  })
})

const candidatePages = [
  '/candidate/cases',
  '/candidate/cases/case-1',
  '/candidate/cases/case-1/inbox',
  '/candidate/cases/case-1/feedback',
  `${record}/demographics`,
  `${record}/history`,
  `${record}/medications`,
  `${record}/clinical-notes`,
  `${record}/referral`,
  `${record}/vitals`,
]

const educatorPages = [
  '/educator/cases/case-1/edit',
  '/educator/cases/case-1/release',
  '/educator/cases/case-1/review/candidate-01',
]

describe('accessibility of existing pages', () => {
  it.each(candidatePages)('has no axe violations on %s', async (path) => {
    await seedAccount(candidateInput)
    renderApp(path)
    await screen.findByRole('heading', { level: 2 })
    expect(await axe(document.body)).toHaveNoViolations()
  })

  it.each(educatorPages)('has no axe violations on %s', async (path) => {
    await seedAccount(educatorInput)
    renderApp(path)
    await screen.findByRole('heading', { level: 2 })
    expect(await axe(document.body)).toHaveNoViolations()
  })
})
