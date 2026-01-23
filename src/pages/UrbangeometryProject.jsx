import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import OptimizedImage from '~/components/OptimizedImage';
import '~/pages/UrbangeometryProject.css';

function UrbangeometryProject() {
  const location = useLocation();
  const scrollToPhotoIndex = location.state?.scrollToPhotoIndex;

  // Header animation states
  const [headerAnimations, setHeaderAnimations] = useState({
    date: false,
    image: false,
    title: false,
    body: false
  });

  // Track which gallery images have loaded in DOM
  const loadedImagesRef = useRef(new Set());
  const hasScrolledRef = useRef(false);

  const galleryImages = [
    '/photos/Urbangeometry/Urbangeometry1.jpg'
  ];

  // Scroll to top immediately on mount (useLayoutEffect runs before paint)
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Handle gallery image load - scroll when target image is ready
  const handleImageLoad = useCallback((index) => {
    loadedImagesRef.current.add(index);

    // Check if we should scroll to a specific photo
    if (scrollToPhotoIndex !== undefined && scrollToPhotoIndex !== null && !hasScrolledRef.current) {
      // Check if target image and all images before it have loaded
      let allLoaded = true;
      for (let i = 0; i <= scrollToPhotoIndex; i++) {
        if (!loadedImagesRef.current.has(i)) {
          allLoaded = false;
          break;
        }
      }

      if (allLoaded) {
        hasScrolledRef.current = true;
        // Small delay to ensure DOM has painted
        requestAnimationFrame(() => {
          const galleryItems = document.querySelectorAll('.gallery-item');
          if (galleryItems[scrollToPhotoIndex]) {
            galleryItems[scrollToPhotoIndex].scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        });
      }
    }
  }, [scrollToPhotoIndex]);

  // Handle animations
  useEffect(() => {
    // Start animations
    setTimeout(() => {
      setHeaderAnimations(prev => ({ ...prev, date: true, image: true, body: true }));
    }, 100);

    setTimeout(() => {
      setHeaderAnimations(prev => ({ ...prev, title: true }));
    }, 250);

    // Fallback scroll in case images don't trigger onLoad
    if (scrollToPhotoIndex !== undefined && scrollToPhotoIndex !== null) {
      const fallbackTimer = setTimeout(() => {
        if (!hasScrolledRef.current) {
          hasScrolledRef.current = true;
          const galleryItems = document.querySelectorAll('.gallery-item');
          if (galleryItems[scrollToPhotoIndex]) {
            galleryItems[scrollToPhotoIndex].scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }
      }, 3000);

      return () => clearTimeout(fallbackTimer);
    }
  }, [location, scrollToPhotoIndex]);

  return (
    <div className="urbangeometry-project">
      <Header />

      {/* Main Container */}
      <section className="main-container">
        {/* Date Frame */}
        <div className={`date-frame ${headerAnimations.date ? 'fade-in-up-quick' : ''}`}>
          <div className="date-text">[ Photo Collections: 2 ]</div>
        </div>

        {/* Content Frame */}
        <div className="content-frame">
          {/* Left Frame - Image with Title Overlay */}
          <div className="image-title-frame">
            <OptimizedImage src="/photos/Urbangeometry/Urbangeometry.jpg" alt="Urban Geometry" className={`urbangeometry-image ${headerAnimations.image ? 'fade-in-up-quick' : ''}`} />
            <h1 className={`urbangeometry-title ${headerAnimations.title ? 'fade-in-up-long' : ''}`}>Urban Geometry</h1>
          </div>

          {/* Right Frame - Body Text */}
          <div className={`body-text ${headerAnimations.body ? 'fade-in-up-quick' : ''}`}>
            This collection highlights the natural patterns that appear in urban settings.
            These photos focus on architectural design, negative space, and the harmony of
            the natural and man-made world. Perspective and framing is very important here
            as it can highlight symmetries and light and identify otherwise hidden textures
            or patterns.
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section">
        {galleryImages.map((image, index) => (
          <div key={index} className="gallery-item">
            <div className="gallery-image-container">
              <OptimizedImage
                src={image}
                alt={`Urban Geometry ${index + 1}`}
                className="gallery-image"
                loading={scrollToPhotoIndex !== undefined ? 'eager' : 'lazy'}
                onLoad={() => handleImageLoad(index)}
              />
            </div>
          </div>
        ))}

      </section>
      <Footer />
    </div>
  );
}

export default UrbangeometryProject;
