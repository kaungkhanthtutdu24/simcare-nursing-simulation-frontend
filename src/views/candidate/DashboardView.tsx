import { Link } from 'react-router'
import {
  ArrowRight,
  Circle,
  CircleCheck,
  FolderOpen,
  Inbox,
  ListChecks,
  MessageSquareText,
} from 'lucide-react'
import { useSession } from '../../auth/session'
import { EmptyState, ErrorState, LoadingState } from '../../components/AsyncState'
import { PageHead } from '../../components/PageHead'
import { Card, StatCard, StatusBadge } from '../../components/ui/Card'
import { useApp } from '../../routes/appContext'
import { paths } from '../../routes/paths'
import { formatProgrammeSummary } from '../../student/programmes'
import { nextStep, progressSteps, recentActivity } from '../../student/progress'
import type { ProgressStep } from '../../student/progress'

const firstName = (name: string) => name.trim().split(/\s+/)[0] || name

/** What the student should do for each step that can be a next step. */
const stepAction: Record<ProgressStep['id'], string> = {
  record: 'Open the patient record',
  note: 'Write your consultation note',
  'inbox-read': 'Read your new inbox item',
  'inbox-response': 'Respond to the inbox item',
  referral: 'Complete the referral',
  feedback: 'Read your feedback',
}

/** Student home: active case, progress, recent activity and feedback, from existing data. */
export function DashboardView() {
  const session = useSession()
  const { demo, candidateId, cases, pathFor } = useApp()
  const work = demo.candidates[candidateId]
  const event = demo.event
  const patient = cases.current?.published ? cases.current : null

  const steps = progressSteps(work, event, patient !== null)
  const doneCount = steps.filter((s) => s.done).length
  const next = nextStep(steps)
  const activity = recentActivity(steps)
  const unread = event.released && !work.inboxOpened
  const summary = session.profile ? formatProgrammeSummary(session.profile) : null

  return (
    <div className="dashboard">
      <PageHead
        title={`Kia ora, ${firstName(session.name)}`}
        description={
          summary ? (
            <span className="programme-summary">{summary}</span>
          ) : (
            <>
              Add your programme details so your educator can see your course.{' '}
              <Link to={paths.candidate.profile}>Complete your profile</Link>
            </>
          )
        }
        breadcrumb={['My learning', 'Dashboard']}
      />

      <div className="stat-grid">
        <StatCard
          label="Steps complete"
          value={`${doneCount} / ${steps.length}`}
          icon={ListChecks}
        />
        <StatCard label="Active cases" value={patient ? 1 : 0} icon={FolderOpen} tone="navy" />
        <StatCard
          label="New inbox items"
          value={unread ? 1 : 0}
          icon={Inbox}
          tone={unread ? 'warning' : 'navy'}
        />
        <StatCard
          label="Feedback"
          value={work.feedbackReleased ? 'Released' : 'Pending'}
          icon={MessageSquareText}
          tone="navy"
        />
      </div>

      <div className="dashboard-grid">
        <Card title="Active case" className="dashboard-active">
          {cases.status === 'loading' ? (
            <LoadingState label="Loading cases…" />
          ) : cases.status === 'error' && cases.error ? (
            <ErrorState error={cases.error} onRetry={cases.reload} />
          ) : patient ? (
            <div className="active-case">
              <div className="active-case-head">
                <span className="case-monogram" aria-hidden="true">
                  {patient.name
                    .split(/\s+/)
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)}
                </span>
                <div>
                  <p className="section-kicker">{patient.id}</p>
                  <p className="active-case-name">{patient.name}</p>
                  <p className="muted">{patient.scenario}</p>
                </div>
              </div>
              {next ? (
                <Link className="primary-button next-step" to={pathFor(next.view)}>
                  <span>
                    <span className="next-step-label">Next step</span>
                    {stepAction[next.id]}
                  </span>
                  <ArrowRight aria-hidden="true" size={18} />
                </Link>
              ) : (
                <p className="muted">
                  {work.feedbackReleased
                    ? 'You have completed every step of this case.'
                    : 'Your work is submitted. Your educator will release feedback.'}
                </p>
              )}
              <Link className="text-link" to={pathFor('overview')}>
                Open patient record
              </Link>
            </div>
          ) : (
            <EmptyState title="No published cases yet">
              Your educator will make a case available here.
            </EmptyState>
          )}
        </Card>

        <Card title="Progress">
          <p className="progress-count">
            {doneCount} of {steps.length} complete
          </p>
          <div
            className="progress-bar"
            role="progressbar"
            aria-label="Case progress"
            aria-valuemin={0}
            aria-valuemax={steps.length}
            aria-valuenow={doneCount}
          >
            <span style={{ width: `${(doneCount / steps.length) * 100}%` }} />
          </div>
          <ul className="step-list">
            {steps.map((step) => (
              <li key={step.id} className={step.done ? 'done' : ''}>
                {step.done ? (
                  <CircleCheck aria-hidden="true" size={18} />
                ) : (
                  <Circle aria-hidden="true" size={18} />
                )}
                <span>{step.label}</span>
                <span className="visually-hidden">{step.done ? ' (done)' : ' (not done)'}</span>
                {!step.available && <StatusBadge tone="neutral">Waiting</StatusBadge>}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Recent activity">
          {activity.length > 0 ? (
            <ol className="activity-list">
              {activity.map((step) => (
                <li key={step.id}>
                  <Link to={pathFor(step.view)}>{step.label}</Link>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState title="No activity yet" />
          )}
          <p className="muted small">
            Shown in workflow order. Activity times are not recorded yet.
          </p>
        </Card>

        <Card title="Latest feedback">
          {work.feedbackReleased ? (
            <>
              <p className="feedback-text">{work.feedback}</p>
              <Link className="text-link" to={pathFor('feedback')}>
                Read full feedback
              </Link>
            </>
          ) : (
            <EmptyState title="No feedback released yet">
              Your educator’s comments will appear here after they are released.
            </EmptyState>
          )}
        </Card>
      </div>
    </div>
  )
}
