import { Navigate } from 'react-router'
import type { RouteObject } from 'react-router'
import { BackgroundView } from '../views/candidate/BackgroundView'
import { CasesView } from '../views/candidate/CasesView'
import { FeedbackView } from '../views/candidate/FeedbackView'
import { InboxView } from '../views/candidate/InboxView'
import { OverviewView } from '../views/candidate/OverviewView'
import { CandidateReviewView } from '../views/educator/CandidateReviewView'
import { CaseEditorView } from '../views/educator/CaseEditorView'
import { EducatorCasesView } from '../views/educator/EducatorCasesView'
import { EventReleaseView } from '../views/educator/EventReleaseView'
import { NotFoundView } from '../views/NotFoundView'
import { ClinicalNotesView } from '../views/record/ClinicalNotesView'
import { DemographicsView } from '../views/record/DemographicsView'
import { HistoryView } from '../views/record/HistoryView'
import { MedicationsView } from '../views/record/MedicationsView'
import { ReferralView } from '../views/record/ReferralView'
import { VitalsView } from '../views/record/VitalsView'
import { AppLayout } from './AppLayout'
import type { RouteHandle } from './AppLayout'
import { CaseRoute, PatientRoute, RequireRole, ReviewRoute } from './guards'
import { CandidatePage, ConsultationRedirect, EducatorPage, ReviewIndexRedirect } from './pages'
import { paths } from './paths'

const handle = (view: RouteHandle['view']): RouteHandle => ({ view })

/**
 * All application routes. URL builders live in ./paths.ts; keep the two in step.
 *
 * Role sections are wrapped in RequireRole so a future signed-in user only
 * sees the sections for their role. That is not a security boundary.
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to={paths.candidate.cases} replace /> },

      {
        path: 'candidate',
        element: <RequireRole role="candidate" />,
        children: [
          { index: true, element: <Navigate to="cases" replace /> },
          {
            path: 'cases',
            handle: handle('cases'),
            element: <CandidatePage component={CasesView} />,
          },
          {
            path: 'cases/:caseId',
            element: <CaseRoute />,
            children: [
              {
                index: true,
                handle: handle('overview'),
                element: <CandidatePage component={OverviewView} />,
              },
              {
                path: 'background',
                handle: handle('overview'),
                element: <CandidatePage component={BackgroundView} />,
              },
              { path: 'consultation', element: <ConsultationRedirect /> },
              {
                path: 'inbox',
                handle: handle('inbox'),
                element: <CandidatePage component={InboxView} />,
              },
              {
                path: 'feedback',
                handle: handle('feedback'),
                element: <CandidatePage component={FeedbackView} />,
              },
              {
                path: 'patients/:patientId',
                element: <PatientRoute />,
                children: [
                  { index: true, element: <Navigate to="demographics" replace /> },
                  {
                    path: 'demographics',
                    handle: handle('demographics'),
                    element: <CandidatePage component={DemographicsView} />,
                  },
                  {
                    path: 'history',
                    handle: handle('history'),
                    element: <CandidatePage component={HistoryView} />,
                  },
                  {
                    path: 'medications',
                    handle: handle('medications'),
                    element: <CandidatePage component={MedicationsView} />,
                  },
                  {
                    path: 'clinical-notes',
                    handle: handle('clinical-notes'),
                    element: <CandidatePage component={ClinicalNotesView} />,
                  },
                  {
                    path: 'referral',
                    handle: handle('referrals'),
                    element: <CandidatePage component={ReferralView} />,
                  },
                  {
                    path: 'vitals',
                    handle: handle('vitals'),
                    element: <CandidatePage component={VitalsView} />,
                  },
                ],
              },
            ],
          },
          { path: '*', element: <NotFoundView /> },
        ],
      },

      {
        path: 'educator',
        element: <RequireRole role="educator" />,
        children: [
          { index: true, element: <Navigate to="cases" replace /> },
          {
            path: 'cases',
            handle: handle('cases'),
            element: <EducatorPage component={EducatorCasesView} />,
          },
          {
            path: 'cases/:caseId',
            element: <CaseRoute />,
            children: [
              { index: true, element: <Navigate to="edit" replace /> },
              {
                path: 'edit',
                handle: handle('case-editor'),
                element: <EducatorPage component={CaseEditorView} />,
              },
              {
                path: 'release',
                handle: handle('release'),
                element: <EducatorPage component={EventReleaseView} />,
              },
              { path: 'review', element: <ReviewIndexRedirect /> },
              {
                path: 'review/:candidateId',
                element: <ReviewRoute />,
                children: [
                  {
                    index: true,
                    handle: handle('review'),
                    element: <EducatorPage component={CandidateReviewView} />,
                  },
                ],
              },
            ],
          },
          { path: '*', element: <NotFoundView /> },
        ],
      },

      { path: '*', element: <NotFoundView /> },
    ],
  },
]
