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
/**
 * Programme details a student chose. Demo-only: stored in this browser with
 * the demo account until the backend provides student profiles.
 */
export interface StudentProfile {
  programme: string
  yearOfStudy: number
  paperCode: string
}

export interface Session {
  accountId: string
  name: string
  email: string
  institutionId: string
  role: Role
  roles: Role[]
  candidateId: CandidateId
  /** Students only. Missing for educators and for accounts created before profiles existed. */
  profile?: StudentProfile
}

export interface SignUpInput {
  name: string
  email: string
  institutionId: string
  role: Role
  password: string
  /** Required for students; ignored for educators. */
  profile?: StudentProfile
}

/** What a student may change on their profile. Role, email and student ID are not editable. */
export interface ProfileUpdate {
  name: string
  profile: StudentProfile
}

export interface AuthState {
  user: Session | null
  signIn: (email: string, password: string) => Promise<Session>
  signUp: (input: SignUpInput) => Promise<Session>
  signOut: () => void
  updateProfile: (update: ProfileUpdate) => Promise<Session>
}

export const SessionContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const auth = useContext(SessionContext)
  if (!auth) throw new Error('useAuth must be used inside a session provider')
  return auth
}

export function useSession(): Session {
  const { user } = useAuth()
  if (!user) throw new Error('useSession must be used inside an authenticated route')
  return user
}
