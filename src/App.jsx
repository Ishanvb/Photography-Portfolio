import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from '~/pages/Home'
import Work from '~/pages/Work'
import About from '~/pages/About'
import Contact from '~/pages/Contact'
import PortraitProject from '~/pages/PortraitProject'
import FashionProject from '~/pages/FashionProject'
import LightProject from '~/pages/LightProject'
import FineartProject from '~/pages/FineartProject'
import UrbangeometryProject from '~/pages/UrbangeometryProject'
import VideographyProject from '~/pages/VideographyProject'
import NotFound from '~/pages/NotFound'
import CustomCursor from '~/components/CustomCursor'
import '~/App.css'

function App() {
  return (
    <>
      <CustomCursor />
      <Router>
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
      </Router>
    </>
  )
}

export default App
