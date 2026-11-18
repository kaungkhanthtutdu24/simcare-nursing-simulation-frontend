import { describe, expect, it } from 'vitest'
import {
  registerDemoAccount,
  restoreSession,
  signInDemoAccount,
  signOutDemoAccount,
  updateDemoProfile,
} from './localAccounts'
import type { ProfileUpdate, SignUpInput } from './session'

const profile = { programme: 'bnurs', yearOfStudy: 2, paperCode: 'NURSE204' }

const student: SignUpInput = {
  name: 'Aroha Williams',
  email: '  Aroha.W@Students.Waikato.ac.nz ',
  institutionId: '1686173',
  role: 'candidate',
  password: 'practice-pass',
  profile,
}

const educator: SignUpInput = {
  name: 'Lecturer One',
  email: 'lecturer@waikato.ac.nz',
  institutionId: 'EDU-102',
  role: 'educator',
  password: 'practice-pass',
}

describe('registerDemoAccount', () => {
  it('rejects a student email outside the student domain', async () => {
    await expect(registerDemoAccount({ ...student, email: 'aroha@gmail.com' })).rejects.toThrow(
      'Use your University of Waikato student email, ending in @students.waikato.ac.nz.',
    )
  })

  it('requires a programme, year and paper for students', async () => {
    await expect(registerDemoAccount({ ...student, profile: undefined })).rejects.toThrow(
      'Choose your nursing programme.',
    )
  })

  it('stores a trimmed, lower-cased student email and the profile', async () => {
    const session = await registerDemoAccount(student)
    expect(session.email).toBe('aroha.w@students.waikato.ac.nz')
    expect(session.role).toBe('candidate')
    expect(session.profile).toEqual(profile)
  })

  it('lets educators register with a staff email and no student profile', async () => {
    const session = await registerDemoAccount(educator)
    expect(session.role).toBe('educator')
    expect(session.profile).toBeUndefined()
  })
})

describe('legacy accounts', () => {
  it('still signs in an account saved before profiles existed', async () => {
    // Create an account, then rewrite it the way the previous version stored it.
    const created = await registerDemoAccount(educator)
    const stored = JSON.parse(localStorage.getItem('simcare-demo-accounts-v1')!)
    stored[0] = {
      ...stored[0],
      email: 'old@gmail.com',
      role: 'candidate',
      institutionId: '123456',
      candidateId: 'student-123456',
    }
    localStorage.setItem('simcare-demo-accounts-v1', JSON.stringify(stored))
    signOutDemoAccount()

    const session = await signInDemoAccount('old@gmail.com', 'practice-pass')
    expect(session.accountId).toBe(created.accountId)
    expect(session.role).toBe('candidate')
    expect(session.profile).toBeUndefined()
  })
})

describe('updateDemoProfile', () => {
  it('saves the name and profile so they survive a reload', async () => {
    const { accountId } = await registerDemoAccount(student)
    updateDemoProfile(accountId, {
      name: 'Aroha W',
      profile: { programme: 'mnursprac', yearOfStudy: 1, paperCode: 'NURSE579' },
    })
    expect(restoreSession()).toMatchObject({
      name: 'Aroha W',
      profile: { programme: 'mnursprac', yearOfStudy: 1, paperCode: 'NURSE579' },
    })
  })

  it('never changes the role, even if the update asks for it', async () => {
    const { accountId } = await registerDemoAccount(student)
    const tampered = { name: 'Aroha', profile, role: 'educator', roles: ['educator'] }
    const session = updateDemoProfile(accountId, tampered as unknown as ProfileUpdate)
    expect(session.role).toBe('candidate')
    expect(session.roles).toEqual(['candidate'])
    expect(restoreSession()?.role).toBe('candidate')
  })

  it('rejects a paper that does not belong to the chosen year', async () => {
    const { accountId } = await registerDemoAccount(student)
    expect(() =>
      updateDemoProfile(accountId, {
        name: 'Aroha',
        profile: { programme: 'bnurs', yearOfStudy: 1, paperCode: 'NURSE204' },
      }),
    ).toThrow('Choose a course or paper.')
  })

  it('refuses to add a student profile to an educator account', async () => {
    const { accountId } = await registerDemoAccount(educator)
    expect(() => updateDemoProfile(accountId, { name: 'Lecturer', profile })).toThrow(
      'Only student accounts have a student profile.',
    )
  })
})
