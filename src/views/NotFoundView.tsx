import { Link, useLocation } from 'react-router'
import { PageHead } from '../components/PageHead'
import { useApp } from '../routes/appContext'
import { roleHome } from '../routes/paths'

export function NotFoundView() {
  const { role } = useApp()
  const { pathname } = useLocation()

  return (
    <>
      <PageHead
        title="Page not found"
        description="This page, case, or patient does not exist in the simulation."
        breadcrumb={[role === 'educator' ? 'Educator' : 'Cases', 'Not found']}
      />
      <article className="card empty-state">
        <h3>404 · Nothing at this address</h3>
        <p>
          <code>{pathname}</code> did not match any page. The link may be out of date, or the case
          ID may have changed.
        </p>
        <Link className="primary-button" to={roleHome(role)}>
          {role === 'educator' ? 'Back to case management →' : 'Back to my cases →'}
        </Link>
      </article>
    </>
  )
}
