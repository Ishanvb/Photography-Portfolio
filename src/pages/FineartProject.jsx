import { useState, useEffect } from 'react';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import OptimizedImage from '~/components/OptimizedImage';
import '~/pages/FineartProject.css';

function FineartProject() {
  // Header animation states
  const [headerAnimations, setHeaderAnimations] = useState({
    date: false,
    image: false,
    title: false,
    body: false
  });

  const galleryImages = [
    '/photos/Fineart/Fineart1.jpg'
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
    <div className="fineart-project">
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
            <OptimizedImage src="/photos/Fineart/Fineart.jpg" alt="Fine Art" className={`fineart-image ${headerAnimations.image ? 'fade-in-up-quick' : ''}`} />
            <h1 className={`fineart-title ${headerAnimations.title ? 'fade-in-up-long' : ''}`}>Fine Art</h1>
          </div>

          {/* Right Frame - Body Text */}
          <div className={`body-text ${headerAnimations.body ? 'fade-in-up-quick' : ''}`}>
            Creating and imagining stories before shooting was a vital part of this collection.
            Brainstorming for this included storyboarding and writing conceptual captions beforehand.
            These photos are meant to be interpreted abstractly with no clear answer for what is occurring
            in the photo. The audience should create their own story based on what is depicted in the image.
            The collection is meant to convey a sense of whimsy and appear as photos that could be found in
            storybooks.
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section">
        {galleryImages.map((image, index) => (
          <div key={index} className="gallery-item">
            <div className="gallery-image-container">
              <OptimizedImage src={image} alt={`Fine Art ${index + 1}`} className="gallery-image" />
            </div>
          </div>
        ))}

      </section>
      <Footer />
    </div>
  );
}

export default FineartProject;
