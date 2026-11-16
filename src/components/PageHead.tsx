import { Fragment } from 'react'
import type { ReactNode } from 'react'

interface PageHeadProps {
  title: string
  description: string
  /** Breadcrumb segments, rendered with › separators. */
  breadcrumb: string[]
  action?: ReactNode
}

export function PageHead({ title, description, breadcrumb, action }: PageHeadProps) {
  return (
    <div className="page-head">
      <div>
        <div className="breadcrumb">
          {breadcrumb.map((segment, index) => (
            <Fragment key={`${index}-${segment}`}>
              {index > 0 && <span>›</span>}
              {segment}
            </Fragment>
          ))}
        </div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </div>
  )
}
