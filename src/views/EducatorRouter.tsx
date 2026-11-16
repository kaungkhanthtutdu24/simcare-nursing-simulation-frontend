import type { View } from '../model'
import type { EducatorViewProps } from './educator/types'
import { CandidateReviewView } from './educator/CandidateReviewView'
import { CaseEditorView } from './educator/CaseEditorView'
import { EducatorCasesView } from './educator/EducatorCasesView'
import { EventReleaseView } from './educator/EventReleaseView'

/** Picks the educator screen for the current view. */
export function EducatorRouter({ view, ...props }: EducatorViewProps & { view: View }) {
  switch (view) {
    case 'cases':
      return <EducatorCasesView {...props} />
    case 'case-editor':
      return <CaseEditorView {...props} />
    case 'release':
      return <EventReleaseView {...props} />
    case 'review':
      return <CandidateReviewView {...props} />
    default:
      return null
  }
}
