import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import OptimizedImage from '~/components/OptimizedImage';
import '~/pages/PortraitProject.css';

function PortraitProject() {
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
    '/photos/PortraitProject/Portrait1.jpg',
    '/photos/PortraitProject/Portrait2.jpg',
    '/photos/PortraitProject/Portrait3.jpg',
    '/photos/PortraitProject/Portrait4.jpg',
    '/photos/PortraitProject/Portrait5.jpg',
    '/photos/PortraitProject/Portrait6.jpg',
    '/photos/PortraitProject/Portrait7.jpg'
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
    <div className="portrait-project">
      <Header />

      {/* Main Container */}
      <section className="main-container">
        {/* Date Frame */}
        <div className={`date-frame ${headerAnimations.date ? 'fade-in-up-quick' : ''}`}>
          <div className="date-text">[ Photo Collections: 8 ]</div>
        </div>

        {/* Content Frame */}
        <div className="content-frame">
          {/* Left Frame - Image with Title Overlay */}
          <div className="image-title-frame">
            <OptimizedImage src="/photos/PortraitProject/Portrait.jpg" alt="Portrait" className={`portrait-image ${headerAnimations.image ? 'fade-in-up-quick' : ''}`} />
            <h1 className={`portrait-title ${headerAnimations.title ? 'fade-in-up-long' : ''}`}>Portraits</h1>
          </div>

          {/* Right Frame - Body Text */}
          <div className={`body-text ${headerAnimations.body ? 'fade-in-up-quick' : ''}`}>
            This collection of portraits was meant to capture the ways I view my friends and their unique auras.
            I used a variety of portrait lighting techniques including split, loop, beauty, rembrandt, paramount,
            and short/broad light. Each of these techniques is used to accentuate the feelings each photo evokes.
            I work with my models to style and pose them in ways that align with their own personal image and
            simultaneously match the vision I conceptualized for the photograph.
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
                alt={`Portrait ${index + 1}`}
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

export default PortraitProject;
