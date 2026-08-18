import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Analytics } from "@vercel/analytics/react"
import CustomCursor from '~/components/CustomCursor'
import LoadingScreen from '~/components/LoadingScreen'

const Home = lazy(() => import('~/pages/Home'))
const Work = lazy(() => import('~/pages/Work'))
const About = lazy(() => import('~/pages/About'))
const Contact = lazy(() => import('~/pages/Contact'))
const ProjectPage = lazy(() => import('~/pages/ProjectPage'))
const NotFound = lazy(() => import('~/pages/NotFound'))

// Admin is split in two on purpose.
//
// AdminLogin is a small public chunk: it must load while signed out, since it
// is the one way in. It contains no management UI — only the passkey prompt.
//
// AdminApp is emitted into /admin-assets/ (see vite.config.js), which
// middleware.js 404s without a valid session, so the management interface is
// never delivered to anyone who is not signed in.
const AdminLogin = lazy(() => import('~/admin/login/AdminLogin'))
const AdminApp = lazy(() => import('~/admin/app/AdminApp'))

function App() {
  return (
    <>
      <Analytics />
      <CustomCursor />
      <Router>
        <Suspense fallback={<LoadingScreen isLoading={true} />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/work" element={<Work />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/work/:slug" element={<ProjectPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </>
  )
}

export default App
