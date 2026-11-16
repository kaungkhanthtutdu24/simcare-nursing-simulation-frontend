import type { Role, View } from '../model'

interface RibbonProps {
  role: Role
  hasUnread: boolean
  onNavigate: (view: View) => void
}

interface RibbonAction {
  label: string
  iconClass: string
  icon: string
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
        { label: 'Cases', iconClass: 'search', icon: '▦', view: 'cases' },
        {
          label: candidate ? 'Patient record' : 'Case editor',
          iconClass: 'person',
          icon: '◫',
          view: candidate ? 'overview' : 'case-editor',
        },
      ],
    },
    {
      label: 'Workflow',
      actions: [
        {
          label: candidate ? 'Consultation' : 'Review work',
          iconClass: 'note',
          icon: '✎',
          view: candidate ? 'clinical-notes' : 'review',
        },
        {
          label: candidate ? 'Inbox' : 'Release event',
          iconClass: 'inbox',
          icon: '▤',
          view: candidate ? 'inbox' : 'release',
        },
      ],
    },
    {
      label: 'Learning',
      actions: [
        {
          label: 'Feedback',
          iconClass: 'review',
          icon: '◇',
          view: candidate ? 'feedback' : 'review',
        },
        {
          label: candidate ? 'Vital signs' : 'Overview',
          iconClass: 'med',
          icon: '☷',
          view: candidate ? 'vitals' : 'cases',
        },
      ],
    },
  ]
}

export function Ribbon({ role, hasUnread, onNavigate }: RibbonProps) {
  const candidate = role === 'candidate'
  const groups = ribbonGroups(role)

  return (
    <>
      <div className="ribbon-tabs">
        <button className="ribbon-tab active" onClick={() => onNavigate('cases')}>
          {candidate ? 'My learning' : 'Educator'}
        </button>
        <button className="ribbon-tab" onClick={() => onNavigate(candidate ? 'inbox' : 'release')}>
          {candidate ? 'Inbox' : 'Events'}
          {candidate && hasUnread && (
            <span className="inbox-flag" aria-label="1 unread item">
              1
            </span>
          )}
        </button>
        <button
          className="ribbon-tab"
          onClick={() => onNavigate(candidate ? 'feedback' : 'review')}
        >
          {candidate ? 'Feedback' : 'Review'}
        </button>
      </div>

      <div className="ribbon" aria-label="Quick actions">
        {groups.map((group, index) => (
          <div
            key={group.label}
            className={index === groups.length - 1 ? 'ribbon-group last' : 'ribbon-group'}
          >
            <div className="ribbon-actions">
              {group.actions.map((action) => (
                <button
                  key={action.label}
                  className="ribbon-action"
                  onClick={() => onNavigate(action.view)}
                >
                  <span className={`action-icon ${action.iconClass}`}>{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
            <span className="ribbon-group-label">{group.label}</span>
          </div>
        ))}
      </div>
    </>
  )
}
