import { Link } from 'react-router'
import { PageHead } from '../components/PageHead'
import { useSession } from '../auth/session'
import { roleHome } from '../routes/paths'

/** Shown when the session lacks the role for a section. Not a security boundary. */
export function AccessDeniedView() {
  const session = useSession()
  const home = session.roles[0]

  return (
    <>
      <PageHead
        title="Access not available"
        description="Your account cannot open this part of the simulation."
        breadcrumb={['Access']}
      />
      <article className="card empty-state">
        <h3>You do not have access to this page</h3>
        <p>Ask your educator or administrator if you think you should.</p>
        {home && (
          <Link className="primary-button" to={roleHome(home)}>
            Go to my workspace →
          </Link>
        )}
      </article>
    </>
  )
}
