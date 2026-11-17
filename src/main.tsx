import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './index.css'
import { DemoSessionProvider } from './auth/DemoSessionProvider'
import { routes } from './routes/routes'

const router = createBrowserRouter(routes)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DemoSessionProvider>
      <RouterProvider router={router} />
    </DemoSessionProvider>
  </StrictMode>,
)
