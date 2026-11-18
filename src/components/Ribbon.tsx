import { Link } from 'react-router'
import type { Role, View } from '../model'
import { navIcons } from './ui/icons'

interface RibbonProps {
  role: Role
  hasUnread: boolean
  pathFor: (view: View) => string
}

interface RibbonAction {
  label: string
  view: View
}

interface RibbonGroup {
  label: string
  actions: RibbonAction[]
}

function ribbonGroups(role: Role): RibbonGroup[] {
  const candidate = role === 'candidate'
  return [
    {
      label: 'Record',
      actions: [
        { label: 'Cases', view: 'cases' },
        candidate
          ? { label: 'Patient record', view: 'overview' }
          : { label: 'Case editor', view: 'case-editor' },
      ],
    },
    {
      label: 'Workflow',
      actions: candidate
        ? [
            { label: 'Consultation', view: 'clinical-notes' },
            { label: 'Inbox', view: 'inbox' },
          ]
        : [
            { label: 'Review work', view: 'review' },
            { label: 'Release event', view: 'release' },
          ],
    },
    {
      label: 'Learning',
      actions: candidate
        ? [
            { label: 'Feedback', view: 'feedback' },
            { label: 'Vital signs', view: 'vitals' },
          ]
        : [{ label: 'Feedback', view: 'review' }],
    },
  ]
}

/** Quick actions for the current case, shown on tablet and desktop. */
export function Ribbon({ role, hasUnread, pathFor }: RibbonProps) {
  const candidate = role === 'candidate'
  return (
    <nav className="ribbon" aria-label="Quick actions">
      {ribbonGroups(role).map((group) => (
        <div key={group.label} className="ribbon-group">
          <span className="ribbon-group-label" aria-hidden="true">
            {group.label}
          </span>
          <div className="ribbon-actions">
            {group.actions.map((action) => {
              const Icon = navIcons[action.view]
              const unread = candidate && action.view === 'inbox' && hasUnread
              return (
                <Link key={action.label} className="ribbon-action" to={pathFor(action.view)}>
                  <Icon aria-hidden="true" size={18} />
                  {action.label}
                  {unread && (
                    <>
                      <span className="inbox-flag" aria-hidden="true">
                        1
                      </span>
                      <span className="visually-hidden">, 1 unread</span>
                    </>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
