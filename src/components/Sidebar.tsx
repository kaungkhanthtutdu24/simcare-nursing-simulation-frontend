import type { CandidateId, Role, View } from '../model'
import { candidateNav, educatorNav } from './navigation'

interface SidebarProps {
  role: Role
  view: View
  candidateId: CandidateId
  hasUnread: boolean
  onNavigate: (view: View) => void
  onCandidateChange: (id: CandidateId) => void
}

export function Sidebar({
  role,
  view,
  candidateId,
  hasUnread,
  onNavigate,
  onCandidateChange,
}: SidebarProps) {
  const candidate = role === 'candidate'
  const nav = candidate ? candidateNav : educatorNav

  return (
    <aside className="sidebar">
      <div className="sidebar-label">{candidate ? 'PATIENT RECORD' : 'EDUCATOR WORKSPACE'}</div>
      {nav.map((item) => (
        <button
          key={item.view}
          className={`side-link ${view === item.view ? 'active' : ''}`}
          onClick={() => onNavigate(item.view)}
        >
          <span className="side-icon">{item.icon}</span>
          <span>{item.label}</span>
          {candidate && item.view === 'inbox' && hasUnread && <span className="nav-count">1</span>}
        </button>
      ))}

      {candidate && (
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
