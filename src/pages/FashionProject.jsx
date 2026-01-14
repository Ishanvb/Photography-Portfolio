import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import './FashionProject.css';

function FashionProject() {
  const location = useLocation();

  // Header animation states
  const [headerAnimations, setHeaderAnimations] = useState({
    date: false,
    image: false,
    title: false,
    body: false
  });

  // Footer animation states
  const footerRef = useRef(null);
  const [footerVisible, setFooterVisible] = useState(false);
  const [showContactBox, setShowContactBox] = useState(false);

  // Scroll to top and trigger header animations on mount
  useEffect(() => {
    const scrollToPhotoIndex = location.state?.scrollToPhotoIndex;

    if (scrollToPhotoIndex !== undefined && scrollToPhotoIndex !== null) {
      // Scroll to specific photo in gallery
      setTimeout(() => {
        const galleryItems = document.querySelectorAll('.gallery-item');
        if (galleryItems[scrollToPhotoIndex]) {
          galleryItems[scrollToPhotoIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 500); // Wait for page to render
    } else {
      window.scrollTo(0, 0);
    }

    // Trigger animations with delays
    setTimeout(() => {
      setHeaderAnimations(prev => ({ ...prev, date: true, image: true, body: true }));
    }, 100);

    setTimeout(() => {
      setHeaderAnimations(prev => ({ ...prev, title: true }));
    }, 250);
  }, [location]);

  // Intersection Observer for footer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !footerVisible) {
            setFooterVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, [footerVisible]);

  // Show contact box after heading is visible
  useEffect(() => {
    if (!footerVisible) return;
    setTimeout(() => setShowContactBox(true), 400);
  }, [footerVisible]);

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

  return (
    <div className="fashion-project">
      <Header />

      {/* Main Container */}
      <section className="main-container">
        {/* Date Frame */}
        <div className={`date-frame ${headerAnimations.date ? 'fade-in-up-quick' : ''}`}>
          <div className="date-text">[ Photo Collections: 5 ]</div>
        </div>

        {/* Content Frame */}
        <div className="content-frame">
          {/* Left Frame - Image with Title Overlay */}
          <div className="image-title-frame">
            <img src="/photos/Fashion/Fashion.jpg" alt="Fashion" className={`fashion-image ${headerAnimations.image ? 'fade-in-up-quick' : ''}`} />
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
              <img src={image} alt={`Fashion ${index + 1}`} className="gallery-image" />
            </div>
          </div>
        ))}

        {/* Footer - Same as Work section */}
        <div className="project-contact-section" ref={footerRef}>
          <div className={`project-together ${footerVisible ? 'fade-in-up' : ''}`}>
            <h2 className="project-heading">
              <span className="semibold">Lets</span> <span className="script">work</span> <span className="semibold">together</span>
            </h2>
          </div>

          <div className={`contact-info ${showContactBox ? 'slide-up' : ''}`}>
            <span className="corner corner-tl"></span>
            <span className="corner corner-tr"></span>
            <span className="corner corner-bl"></span>
            <span className="corner corner-br"></span>

            <p className="contact-text">Contact:</p>
            <p className="contact-text">
              Mobile: <a href="tel:+15127756749" className="contact-link">+1 512.775.6749</a>
            </p>
            <p className="contact-text">
              <a href="mailto:mariannaparzick@gmail.com" className="contact-link">mariannaparzick@gmail.com</a>
            </p>
            <p className="contact-text">
              LinkedIn: <a href="https://www.linkedin.com/in/marianna-parzick/" target="_blank" rel="noopener noreferrer" className="contact-link contact-link-underline">marianna-parzick</a>
            </p>
            <p className="contact-text">
              Instagram: <a href="https://www.instagram.com/fla5hedbymari?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="contact-link">@fla5hedbymari</a>
            </p>
            <p className="contact-text">Reach Out!</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default FashionProject;
