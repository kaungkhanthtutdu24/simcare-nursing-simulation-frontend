import type { CandidateWork, ScenarioEvent, View } from '../model'

/**
 * A student's progress through a case, worked out from data the app already
 * keeps. There are no timestamps, so activity is ordered by workflow stage.
 */
export interface ProgressStep {
  id: 'record' | 'note' | 'inbox-read' | 'inbox-response' | 'referral' | 'feedback'
  label: string
  done: boolean
  /** False when the step cannot be done yet (inbox steps before an event is released). */
  available: boolean
  view: View
}

/** `hasCase` is false when no published case is open, so the record is not available yet. */
export function progressSteps(
  work: CandidateWork,
  event: ScenarioEvent,
  hasCase = true,
): ProgressStep[] {
  const inbox = event.released
  return [
    {
      id: 'record',
      label: 'Patient record available',
      done: hasCase,
      available: hasCase,
      view: 'overview',
    },
    {
      id: 'note',
      label: 'Consultation note submitted',
      done: work.noteSubmitted,
      available: true,
      view: 'clinical-notes',
    },
    {
      id: 'inbox-read',
      label: 'Inbox item read',
      done: inbox && work.inboxOpened,
      available: inbox,
      view: 'inbox',
    },
    {
      id: 'inbox-response',
      label: 'Inbox response submitted',
      done: inbox && work.responseSubmitted,
      available: inbox,
      view: 'inbox',
    },
    {
      id: 'referral',
      label: 'Referral submitted',
      done: work.referral.submitted,
      available: true,
      view: 'referrals',
    },
    {
      id: 'feedback',
      label: 'Feedback released',
      done: work.feedbackReleased,
      available: true,
      view: 'feedback',
    },
  ]
}

/** The first step the student can act on now. Feedback is released by the educator, so it is never a next step. */
export function nextStep(steps: ProgressStep[]): ProgressStep | null {
  return steps.find((s) => !s.done && s.available && s.id !== 'feedback') ?? null
}

export function recentActivity(steps: ProgressStep[]): ProgressStep[] {
  return steps.filter((s) => s.done).reverse()
}
