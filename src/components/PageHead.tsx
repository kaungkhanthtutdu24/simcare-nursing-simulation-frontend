import type { ReactNode } from 'react'

interface PageHeadProps {
  title: string
  description: ReactNode
  /** Breadcrumb segments, shown as an ordered list with › separators. */
  breadcrumb: string[]
  action?: ReactNode
}

export function PageHead({ title, description, breadcrumb, action }: PageHeadProps) {
  return (
    <div className="page-head">
      <div>
        <nav aria-label="Breadcrumb">
          <ol className="breadcrumb">
            {breadcrumb.map((segment, index) => (
              <li
                key={`${index}-${segment}`}
                aria-current={index === breadcrumb.length - 1 ? 'page' : undefined}
              >
                {segment}
              </li>
            ))}
          </ol>
        </nav>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </div>
  )
}
