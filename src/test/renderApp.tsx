import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { DemoSessionProvider } from '../auth/DemoSessionProvider'
import { registerDemoAccount } from '../auth/localAccounts'
import type { Session, SignUpInput } from '../auth/session'
import { routes } from '../routes/routes'

/** Renders the whole app at a URL, with the real routes and demo session provider. */
export function renderApp(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const user = userEvent.setup()
  render(
    <DemoSessionProvider>
      <RouterProvider router={router} />
    </DemoSessionProvider>,
  )
  return { router, user }
}

/** Registers a demo account and leaves it signed in for the next render. */
export function seedAccount(input: SignUpInput): Promise<Session> {
  return registerDemoAccount(input)
}

export const candidateInput: SignUpInput = {
  name: 'Aroha Test',
  email: 'aroha.test@students.waikato.ac.nz',
  institutionId: '1686173',
  role: 'candidate',
  password: 'practice-pass',
  profile: { programme: 'bnurs', yearOfStudy: 2, paperCode: 'NURSE204' },
}

export const educatorInput: SignUpInput = {
  name: 'Educator Test',
  email: 'educator@waikato.ac.nz',
  institutionId: 'EDU-102',
  role: 'educator',
  password: 'practice-pass',
}
