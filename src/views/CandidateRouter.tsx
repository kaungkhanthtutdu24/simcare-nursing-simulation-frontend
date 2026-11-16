import type { View } from '../model'
import type { CandidateFlowProps } from './types'
import { BackgroundView } from './candidate/BackgroundView'
import { CasesView } from './candidate/CasesView'
import { ConsultationView } from './candidate/ConsultationView'
import { FeedbackView } from './candidate/FeedbackView'
import { InboxView } from './candidate/InboxView'
import { OverviewView } from './candidate/OverviewView'
import { ClinicalNotesView } from './record/ClinicalNotesView'
import { DemographicsView } from './record/DemographicsView'
import { HistoryView } from './record/HistoryView'
import { MedicationsView } from './record/MedicationsView'
import { ReferralView } from './record/ReferralView'
import { VitalsView } from './record/VitalsView'

/** Picks the candidate screen for the current view. */
export function CandidateRouter({ view, ...props }: CandidateFlowProps & { view: View }) {
  switch (view) {
    case 'cases':
      return <CasesView {...props} />
    case 'overview':
      return <OverviewView {...props} />
    case 'consultation':
      return <ConsultationView {...props} />
    case 'background':
      return <BackgroundView patient={props.patient} />
    case 'inbox':
      return <InboxView {...props} />
    case 'feedback':
      return <FeedbackView {...props} />
    case 'demographics':
      return <DemographicsView {...props} />
    case 'history':
      return <HistoryView {...props} />
    case 'medications':
      return <MedicationsView {...props} />
    case 'clinical-notes':
      return <ClinicalNotesView {...props} />
    case 'referrals':
      return <ReferralView {...props} />
    case 'vitals':
      return <VitalsView {...props} />
    default:
      return null
  }
}
