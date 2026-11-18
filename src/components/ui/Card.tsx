import { useId } from 'react'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export function Card({
  title,
  action,
  children,
  className = '',
  as: Tag = 'section',
}: {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  as?: 'section' | 'article'
}) {
  const titleId = useId()
  return (
    <Tag className={`ui-card ${className}`} aria-labelledby={title ? titleId : undefined}>
      {(title || action) && (
        <div className="ui-card-head">
          {title && <h3 id={titleId}>{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </Tag>
  )
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'teal',
}: {
  label: string
  value: ReactNode
  icon?: LucideIcon
  tone?: 'teal' | 'navy' | 'warning'
}) {
  return (
    <div className={`stat-card tone-${tone}`}>
      {Icon && (
        <span className="stat-icon">
          <Icon aria-hidden="true" size={20} />
        </span>
      )}
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}

export function StatusBadge({
  tone,
  children,
}: {
  tone: 'success' | 'warning' | 'neutral' | 'danger'
  children: ReactNode
}) {
  return <span className={`status-badge tone-${tone}`}>{children}</span>
}
