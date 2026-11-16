import type { View } from '../model'

export interface NavItem {
  view: View
  label: string
  icon: string
}

export const candidateNav: NavItem[] = [
  { view: 'cases', label: 'My cases', icon: '▦' },
  { view: 'overview', label: 'Overview', icon: '◫' },
  { view: 'demographics', label: 'Demographics', icon: '♙' },
  { view: 'history', label: 'Medical history', icon: '☷' },
  { view: 'medications', label: 'Medications', icon: '✚' },
  { view: 'clinical-notes', label: 'Clinical notes', icon: '✎' },
  { view: 'inbox', label: 'Clinical inbox', icon: '▤' },
  { view: 'referrals', label: 'Referral', icon: '➜' },
  { view: 'vitals', label: 'Vital signs', icon: '♡' },
  { view: 'feedback', label: 'Feedback', icon: '◇' },
]

export const educatorNav: NavItem[] = [
  { view: 'cases', label: 'Cases', icon: '▦' },
  { view: 'case-editor', label: 'Case editor', icon: '✎' },
  { view: 'release', label: 'Event release', icon: '▤' },
  { view: 'review', label: 'Candidate review', icon: '◇' },
]

/** Candidate views that edit the patient record (rendered by RecordViews). */
export const recordViews: View[] = [
  'demographics',
  'history',
  'medications',
  'clinical-notes',
  'referrals',
  'vitals',
]
