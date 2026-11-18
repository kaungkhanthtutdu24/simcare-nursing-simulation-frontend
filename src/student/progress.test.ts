import { describe, expect, it } from 'vitest'
import { emptyCandidate } from '../model'
import type { CandidateWork, ScenarioEvent } from '../model'
import { nextStep, progressSteps, recentActivity } from './progress'

const released: ScenarioEvent = {
  title: 'Follow-up report',
  content: '',
  kind: 'Laboratory result',
  released: true,
}
const held: ScenarioEvent = { ...released, released: false }

const fresh = emptyCandidate('Aroha Williams')
const finished: CandidateWork = {
  ...fresh,
  noteSubmitted: true,
  inboxOpened: true,
  responseSubmitted: true,
  referral: { ...fresh.referral, submitted: true },
  feedbackReleased: true,
}

const done = (work: CandidateWork, event: ScenarioEvent, hasCase = true) =>
  progressSteps(work, event, hasCase)
    .filter((s) => s.done)
    .map((s) => s.id)

describe('progressSteps', () => {
  it('lists the six workflow steps with labels', () => {
    expect(progressSteps(fresh, released).map((s) => s.label)).toEqual([
      'Patient record available',
      'Consultation note submitted',
      'Inbox item read',
      'Inbox response submitted',
      'Referral submitted',
      'Feedback released',
    ])
  })

  it('counts only the record as done for fresh work', () => {
    expect(done(fresh, released)).toEqual(['record'])
  })

  it('counts every step for finished work', () => {
    expect(done(finished, released)).toHaveLength(6)
  })

  it('does not count inbox steps while the event is held', () => {
    expect(done(finished, held)).toEqual(['record', 'note', 'referral', 'feedback'])
  })

  it('does not count the record as available without an active case', () => {
    expect(done(fresh, released, false)).toEqual([])
  })

  it('links each step to the screen where it is done', () => {
    expect(progressSteps(fresh, released).map((s) => s.view)).toEqual([
      'overview',
      'clinical-notes',
      'inbox',
      'inbox',
      'referrals',
      'feedback',
    ])
  })
})

describe('nextStep', () => {
  it('points to the consultation note for fresh work', () => {
    expect(nextStep(progressSteps(fresh, released))?.id).toBe('note')
  })

  it('returns null when everything is done', () => {
    expect(nextStep(progressSteps(finished, released))).toBeNull()
  })

  it('skips inbox steps while the event is held', () => {
    const work = { ...fresh, noteSubmitted: true }
    expect(nextStep(progressSteps(work, held))?.id).toBe('referral')
  })
})

describe('recentActivity', () => {
  it('lists completed steps, most advanced first', () => {
    const work = { ...fresh, noteSubmitted: true, feedbackReleased: true }
    expect(recentActivity(progressSteps(work, released)).map((s) => s.id)).toEqual([
      'feedback',
      'note',
      'record',
    ])
  })
})
