import { createContext, useContext } from 'react'
import type { CandidateId, Role } from '../model'

/**
 * Who is using the app and which roles they may use.
 *
 * IMPORTANT: this only shapes the user interface. Hiding a route in the browser
 * is not security; anyone can change frontend code or call an API directly.
 * When the C# backend is added it must decide the user's role and candidate
 * identity, and enforce access to every case, record and feedback item itself.
 */
export interface Session {
  /** Roles this user is allowed to use. */
  roles: Role[]
  /** The candidate workspace this user works in when acting as a candidate. */
  candidateId: CandidateId
  /** Demo only: lets the presenter switch between candidate workspaces. */
  switchCandidate?: (id: CandidateId) => void
}

export const SessionContext = createContext<Session | null>(null)

export function useSession(): Session {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useSession must be used inside a session provider')
  return session
}
