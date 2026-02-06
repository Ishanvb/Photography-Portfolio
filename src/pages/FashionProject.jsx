import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import OptimizedImage from '~/components/OptimizedImage';
import LoadingScreen from '~/components/LoadingScreen';
import '~/pages/FashionProject.css';

function FashionProject() {
  const location = useLocation();
  const scrollToPhotoIndex = location.state?.scrollToPhotoIndex;

  // Header animation states
  const [headerAnimations, setHeaderAnimations] = useState({
    date: false,
    image: false,
    title: false,
    body: false
  });

  // Loading state - wait for all gallery images
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Track which gallery images have loaded in DOM
  const loadedImagesRef = useRef(new Set());
  const hasScrolledRef = useRef(false);

  const galleryImages = [
    '/photos/Fashion/Fashion1.jpg',
    '/photos/Fashion/Fashion2.jpg',
    '/photos/Fashion/Fashion3.jpg',
    '/photos/Fashion/Fashion4.jpg',
    '/photos/Fashion/Fashion5.jpg',
    '/photos/Fashion/Fashion6.jpg',
    '/photos/Fashion/Fashion7.jpg',
    '/photos/Fashion/Fashion8.jpg',
    '/photos/Fashion/Fashion9.jpg',
    '/photos/Fashion/Fashion10.jpg',
    '/photos/Fashion/Fashion11.jpg',
    '/photos/Fashion/Fashion12.jpg',
    '/photos/Fashion/Fashion13.jpg',
    '/photos/Fashion/Fashion14.jpg',
    '/photos/Fashion/Fashion15.jpg'
  ];

  // Scroll to top immediately on mount (useLayoutEffect runs before paint)
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Lock scroll while loading
  useEffect(() => {
    if (!imagesLoaded) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [imagesLoaded]);

  // Handle gallery image load - track for loading screen + scroll when target is ready
  const handleImageLoad = useCallback((index) => {
    loadedImagesRef.current.add(index);

    // Check if all gallery images are loaded for loading screen
    if (loadedImagesRef.current.size >= galleryImages.length) {
      setImagesLoaded(true);
    }

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
  }, [scrollToPhotoIndex, galleryImages.length]);

  // Handle loading screen fade complete - restore scroll
  const handleLoadingFadeComplete = useCallback(() => {
    document.body.style.overflow = '';
  }, []);

  // Handle animations
  useEffect(() => {
    // Start animations
    setTimeout(() => {
      setHeaderAnimations(prev => ({ ...prev, date: true, image: true, body: true }));
    }, 100);

    setTimeout(() => {
      setHeaderAnimations(prev => ({ ...prev, title: true }));
    }, 250);

    // Fallback timeout for loading screen
    const loadingFallback = setTimeout(() => {
      setImagesLoaded(true);
    }, 8000);

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

      return () => {
        clearTimeout(fallbackTimer);
        clearTimeout(loadingFallback);
      };
    }

    return () => clearTimeout(loadingFallback);
  }, [location, scrollToPhotoIndex]);

  return (
    <div className="fashion-project">
      <LoadingScreen isLoading={!imagesLoaded} onFadeComplete={handleLoadingFadeComplete} />
      <Header />

      {/* Main Container */}
      <section className="main-container">
        {/* Date Frame */}
        <div className={`date-frame ${headerAnimations.date ? 'fade-in-up-quick' : ''}`}>
          <div className="date-text">[ Photo Collections: 16 ]</div>
        </div>

        {/* Content Frame */}
        <div className="content-frame">
          {/* Left Frame - Image with Title Overlay */}
          <div className="image-title-frame">
            <OptimizedImage src="/photos/Fashion/Fashion.jpg" alt="Fashion" className={`fashion-image ${headerAnimations.image ? 'fade-in-up-quick' : ''}`} />
            <h1 className={`fashion-title ${headerAnimations.title ? 'fade-in-up-long' : ''}`}>Fashion</h1>
          </div>

          {/* Right Frame - Body Text */}
          <div className={`body-text ${headerAnimations.body ? 'fade-in-up-quick' : ''}`}>
            My fashion photoshoots are intended to be styled and framed in ways that emulate a
            specific time period of fashion, industry, or lifestyle. The highlight of these photos
            is the clothing and accessories, but the models contribute to telling a story about
            the chosen aesthetic. Using technical skills, creative vision, elements like styling,
            location, and mood help elevate garments beyond mere products into encompassing a curated
            atmosphere/visual.
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
                alt={`Fashion ${index + 1}`}
                className="gallery-image"
                loading="eager"
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

export default FashionProject;
