import { Link } from 'react-router'
import type { CandidateId, Role, View } from '../model'
import { candidateNav, educatorNav } from './navigation'

interface SidebarProps {
  role: Role
  /** Screen the current route belongs to; its link is highlighted. */
  currentView: View | undefined
  candidateId: CandidateId
  hasUnread: boolean
  pathFor: (view: View) => string
  /** Demo only: shows the candidate workspace selector when provided. */
  onCandidateChange?: (id: CandidateId) => void
}

export function Sidebar({
  role,
  currentView,
  candidateId,
  hasUnread,
  pathFor,
  onCandidateChange,
}: SidebarProps) {
  const candidate = role === 'candidate'
  const nav = candidate ? candidateNav : educatorNav

  return (
    <aside className="sidebar">
      <div className="sidebar-label">{candidate ? 'PATIENT RECORD' : 'EDUCATOR WORKSPACE'}</div>
      {nav.map((item) => {
        const active = currentView === item.view
        return (
          <Link
            key={item.view}
            to={pathFor(item.view)}
            className={`side-link ${active ? 'active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <span className="side-icon">{item.icon}</span>
            <span>{item.label}</span>
            {candidate && item.view === 'inbox' && hasUnread && (
              <span className="nav-count">1</span>
            )}
          </Link>
        )
      })}

      {candidate && onCandidateChange && (
        <>
          <div className="sidebar-separator" />
          <div className="sidebar-label">DEMO ACCOUNT</div>
          <label className="sidebar-select">
            Candidate
            <select
              value={candidateId}
              onChange={(e) => onCandidateChange(e.target.value as CandidateId)}
            >
              <option value="candidate-01">Candidate 01</option>
              <option value="candidate-02">Candidate 02</option>
            </select>
          </label>
        </>
      )}

      <div className="sidebar-footer">
        <span className="mini-icon">i</span>
        <span>
          Training workspace
          <br />
          <small>No real patient data</small>
        </span>
      </div>
    </aside>
  )
}
