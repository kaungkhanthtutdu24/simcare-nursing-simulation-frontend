import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { ShieldCheck } from 'lucide-react'
import type { Role, View } from '../model'
import { candidateNavGroups, educatorNavGroups } from './navigation'
import { navIcons } from './ui/icons'

interface SidebarProps {
  role: Role
  /** Screen the current route belongs to; its link is highlighted. */
  currentView: View | undefined
  hasUnread: boolean
  hasCase: boolean
  pathFor: (view: View) => string
  /** Drawer state on small screens. Ignored by the desktop and tablet layouts. */
  open: boolean
  onClose: () => void
}

export function Sidebar({
  role,
  currentView,
  hasUnread,
  hasCase,
  pathFor,
  open,
  onClose,
}: SidebarProps) {
  const candidate = role === 'candidate'
  const groups = (candidate ? candidateNavGroups : educatorNavGroups).filter(
    (group) => !group.requiresCase || hasCase,
  )
  const navRef = useRef<HTMLElement>(null)

  // When the drawer opens, move focus into it; Escape closes it.
  useEffect(() => {
    if (!open) return
    navRef.current?.querySelector<HTMLElement>('a')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      {open && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={onClose}
        />
      )}
      <nav
        id="app-sidebar"
        ref={navRef}
        className={`sidebar ${open ? 'open' : ''}`}
        aria-label="Main navigation"
      >
        {groups.map((group) => {
          const labelId = `nav-group-${group.label.toLowerCase().replace(/\s+/g, '-')}`
          return (
            <div className="nav-group" key={group.label}>
              <p className="nav-group-label" id={labelId}>
                {group.label}
              </p>
              <ul aria-labelledby={labelId}>
                {group.items.map((item) => {
                  const active = currentView === item.view
                  const Icon = navIcons[item.view]
                  const unread = candidate && item.view === 'inbox' && hasUnread
                  return (
                    <li key={item.view}>
                      <Link
                        to={pathFor(item.view)}
                        className={`side-link ${active ? 'active' : ''}`}
                        aria-current={active ? 'page' : undefined}
                        title={item.label}
                        onClick={onClose}
                      >
                        <Icon className="side-icon" aria-hidden="true" size={20} />
                        <span className="side-label">{item.label}</span>
                        {unread && (
                          <>
                            <span className="nav-count" aria-hidden="true">
                              1
                            </span>
                            <span className="visually-hidden">, 1 unread</span>
                          </>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}

        <div className="sidebar-footer">
          <ShieldCheck aria-hidden="true" size={18} />
          <span className="side-label">
            Training workspace
            <br />
            <small>No real patient data</small>
          </span>
        </div>
      </nav>
    </>
  )
}
