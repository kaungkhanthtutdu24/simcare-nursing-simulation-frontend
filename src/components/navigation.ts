import type { View } from '../model'

export interface NavItem {
  view: View
  label: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
  /** Shown only when a case is loaded (its links open that case). */
  requiresCase?: boolean
}

export const candidateNavGroups: NavGroup[] = [
  {
    label: 'My learning',
    items: [
      { view: 'dashboard', label: 'Dashboard' },
      { view: 'profile', label: 'Profile' },
      { view: 'cases', label: 'My cases' },
      { view: 'feedback', label: 'Feedback' },
    ],
  },
  {
    label: 'Patient record',
    requiresCase: true,
    items: [
      { view: 'overview', label: 'Overview' },
      { view: 'demographics', label: 'Demographics' },
      { view: 'history', label: 'Medical history' },
      { view: 'medications', label: 'Medications' },
      { view: 'clinical-notes', label: 'Clinical notes' },
      { view: 'inbox', label: 'Clinical inbox' },
      { view: 'referrals', label: 'Referral' },
      { view: 'vitals', label: 'Vital signs' },
    ],
  },
]

export const educatorNavGroups: NavGroup[] = [
  {
    label: 'Educator workspace',
    items: [
      { view: 'cases', label: 'Cases' },
      { view: 'case-editor', label: 'Case editor' },
      { view: 'release', label: 'Event release' },
      { view: 'review', label: 'Candidate review' },
    ],
  },
]

/** Flat lists, kept for code that used the earlier navigation shape. */
export const candidateNav: NavItem[] = candidateNavGroups.flatMap((g) => g.items)
export const educatorNav: NavItem[] = educatorNavGroups.flatMap((g) => g.items)

/** Candidate views that edit the patient record. */
export const recordViews: View[] = [
  'demographics',
  'history',
  'medications',
  'clinical-notes',
  'referrals',
  'vitals',
]
