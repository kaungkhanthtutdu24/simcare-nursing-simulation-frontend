import type { ReactNode } from 'react'

interface RepeatCardProps {
  title: string
  onRemove: () => void
  children: ReactNode
}

/** One entry in a repeatable list (condition, medication, vital signs review, ...). */
export function RepeatCard({ title, onRemove, children }: RepeatCardProps) {
  return (
    <div className="repeat-card">
      <div className="repeat-head">
        <strong>{title}</strong>
        <button className="text-button" onClick={onRemove}>
          Remove
        </button>
      </div>
      {children}
    </div>
  )
}
