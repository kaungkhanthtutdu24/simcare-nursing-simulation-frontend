import type { Role } from '../model'

interface TitleBarProps {
  role: Role
  displayName: string
  onSwitchRole: () => void
}

export function TitleBar({ role, displayName, onSwitchRole }: TitleBarProps) {
  return (
    <header className="titlebar">
      <div className="brand">
        <span className="brand-mark">✚</span>
        <div>
          <strong>SimCare</strong>
          <small>NURSING SIMULATION</small>
        </div>
      </div>
      <div className="titlebar-right">
        <span className="course-label">Clinical learning workspace</span>
        <span className="simulation-badge">
          <span className="status-dot" /> Fictional training data
        </span>
        <button
          className="role-switch"
          onClick={onSwitchRole}
          title="Switch between candidate and educator demo views"
        >
          <span className="role-avatar">{role === 'candidate' ? 'C' : 'E'}</span>
          {displayName} · Switch role ↔
        </button>
      </div>
    </header>
  )
}
