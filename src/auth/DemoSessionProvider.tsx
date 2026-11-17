import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { CandidateId } from '../model'
import { SessionContext } from './session'
import type { Session } from './session'

/**
 * Demo session: one person can act as either role and switch candidate
 * workspaces. Replace with a provider that reads the signed-in user from the
 * backend once authentication exists.
 */
export function DemoSessionProvider({ children }: { children: ReactNode }) {
  const [candidateId, setCandidateId] = useState<CandidateId>('candidate-01')
  const session = useMemo<Session>(
    () => ({ roles: ['candidate', 'educator'], candidateId, switchCandidate: setCandidateId }),
    [candidateId],
  )
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}
