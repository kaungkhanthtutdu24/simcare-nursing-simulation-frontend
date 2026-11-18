import type { Ref } from 'react'
import { Link } from 'react-router'
import { LogOut, Menu, Stethoscope, UserRound } from 'lucide-react'
import type { Role } from '../model'
import { paths } from '../routes/paths'

interface TitleBarProps {
  role: Role
  displayName: string
  onSignOut: () => void
  menuOpen: boolean
  onToggleMenu: () => void
  menuButtonRef: Ref<HTMLButtonElement>
}

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || '?'

export function TitleBar({
  role,
  displayName,
  onSignOut,
  menuOpen,
  onToggleMenu,
  menuButtonRef,
}: TitleBarProps) {
  const candidate = role === 'candidate'
  return (
    <header className="titlebar">
      <button
        ref={menuButtonRef}
        type="button"
        className="menu-button"
        aria-controls="app-sidebar"
        aria-expanded={menuOpen}
        onClick={onToggleMenu}
      >
        <Menu aria-hidden="true" size={22} />
        <span className="visually-hidden">Menu</span>
      </button>
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <Stethoscope size={20} />
        </span>
        <div>
          <strong>SimCare</strong>
          <small>Nursing simulation</small>
        </div>
      </div>
      <div className="titlebar-right">
        <span className="simulation-badge">
          <span className="status-dot" aria-hidden="true" /> Fictional training data
        </span>
        <div className="account">
          <span className="role-avatar" aria-hidden="true">
            {initials(displayName)}
          </span>
          <span className="account-name">
            {displayName}
            <small>{candidate ? 'Student nurse' : 'Educator'}</small>
          </span>
          {candidate && (
            <Link className="account-action" to={paths.candidate.profile}>
              <UserRound aria-hidden="true" size={18} />
              <span className="account-action-label">Profile</span>
            </Link>
          )}
          <button className="account-action" type="button" onClick={onSignOut}>
            <LogOut aria-hidden="true" size={18} />
            <span className="account-action-label">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
