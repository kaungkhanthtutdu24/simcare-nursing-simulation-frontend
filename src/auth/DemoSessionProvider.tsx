import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  registerDemoAccount,
  restoreSession,
  signInDemoAccount,
  signOutDemoAccount,
  updateDemoProfile,
} from './localAccounts'
import { SessionContext } from './session'
import type { AuthState, ProfileUpdate, SignUpInput } from './session'

/** Temporary browser-local authentication while backend auth is being built. */
export function DemoSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(restoreSession)

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await signInDemoAccount(email, password)
    setUser(session)
    return session
  }, [])

  const signUp = useCallback(async (input: SignUpInput) => {
    const session = await registerDemoAccount(input)
    setUser(session)
    return session
  }, [])

  const signOut = useCallback(() => {
    signOutDemoAccount()
    setUser(null)
  }, [])

  const accountId = user?.accountId
  const updateProfile = useCallback(
    async (update: ProfileUpdate) => {
      if (!accountId) throw new Error('Sign in to update your profile.')
      const session = updateDemoProfile(accountId, update)
      setUser(session)
      return session
    },
    [accountId],
  )

  const value = useMemo<AuthState>(
    () => ({ user, signIn, signUp, signOut, updateProfile }),
    [user, signIn, signUp, signOut, updateProfile],
  )
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
