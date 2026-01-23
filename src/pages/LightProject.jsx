import { useState, useEffect } from 'react';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import OptimizedImage from '~/components/OptimizedImage';
import '~/pages/LightProject.css';

function LightProject() {
  // Header animation states
  const [headerAnimations, setHeaderAnimations] = useState({
    date: false,
    image: false,
    title: false,
    body: false
  });

  const galleryImages = [
    '/photos/Light/Light1.jpg',
    '/photos/Light/Light2.jpg',
    '/photos/Light/Light3.jpg'
  ];

  // Scroll to top immediately on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle animations
  useEffect(() => {
    setTimeout(() => {
      setHeaderAnimations(prev => ({ ...prev, date: true, image: true, body: true }));
    }, 100);

    setTimeout(() => {
      setHeaderAnimations(prev => ({ ...prev, title: true }));
    }, 250);
  }, []);

  return (
    <div className="light-project">
      <Header />

      {/* Main Container */}
      <section className="main-container">
        {/* Date Frame */}
        <div className={`date-frame ${headerAnimations.date ? 'fade-in-up-quick' : ''}`}>
          <div className="date-text">[ Photo Collections: 4 ]</div>
        </div>

        {/* Content Frame */}
        <div className="content-frame">
          {/* Left Frame - Image with Title Overlay */}
          <div className="image-title-frame">
            <OptimizedImage src="/photos/Light/Light.jpg" alt="Light" className={`light-image ${headerAnimations.image ? 'fade-in-up-quick' : ''}`} />
            <h1 className={`light-title ${headerAnimations.title ? 'fade-in-up-long' : ''}`}>Light</h1>
          </div>

          {/* Right Frame - Body Text */}
          <div className={`body-text ${headerAnimations.body ? 'fade-in-up-quick' : ''}`}>
            In this collection I used a photographic technique called painting with light.
            I used various light sources to illuminate parts of a scene during a long exposure.
            This method allows for the creation of unique light patterns, highlights, and artistic
            effects that are not possible with standard lighting techniques. A combination of gelled
            lights, external flash, and natural light was used to paint the photo interpretation of
            song lyrics I chose beforehand.
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section">
        {galleryImages.map((image, index) => (
          <div key={index} className="gallery-item">
            <div className="gallery-image-container">
              <OptimizedImage src={image} alt={`Light ${index + 1}`} className="gallery-image" />
            </div>
          </div>
        ))}

      </section>
      <Footer />
    </div>
  );
}

export default LightProject;
