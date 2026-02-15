import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Analytics } from "@vercel/analytics/react"
import CustomCursor from '~/components/CustomCursor'
import LoadingScreen from '~/components/LoadingScreen'

const Home = lazy(() => import('~/pages/Home'))
const Work = lazy(() => import('~/pages/Work'))
const About = lazy(() => import('~/pages/About'))
const Contact = lazy(() => import('~/pages/Contact'))
const PortraitProject = lazy(() => import('~/pages/PortraitProject'))
const FashionProject = lazy(() => import('~/pages/FashionProject'))
const LightProject = lazy(() => import('~/pages/LightProject'))
const FineartProject = lazy(() => import('~/pages/FineartProject'))
const UrbangeometryProject = lazy(() => import('~/pages/UrbangeometryProject'))
const VideographyProject = lazy(() => import('~/pages/VideographyProject'))
const NotFound = lazy(() => import('~/pages/NotFound'))

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
            <Route path="/work/portrait-project" element={<PortraitProject />} />
            <Route path="/work/fashion-project" element={<FashionProject />} />
            <Route path="/work/light-project" element={<LightProject />} />
            <Route path="/work/fineart-project" element={<FineartProject />} />
            <Route path="/work/urbangeometry-project" element={<UrbangeometryProject />} />
            <Route path="/work/videography-project" element={<VideographyProject />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </>
  )
}

export default App
