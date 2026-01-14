import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import './About.css';

function About() {
  // Content animation states
  const [showTopFrame, setShowTopFrame] = useState(false);
  const [showBottomFrame, setShowBottomFrame] = useState(false);

  // Footer animation states
  const footerRef = useRef(null);
  const [footerVisible, setFooterVisible] = useState(false);
  const [showContactBox, setShowContactBox] = useState(false);

  // Trigger content animations on mount
  useEffect(() => {
    setShowTopFrame(true);
    setTimeout(() => setShowBottomFrame(true), 300);
  }, []);

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

  return (
    <div className="about">
      <Header />
      <div className="about-container">
        {/* First major frame - About Me section */}
        <div className={`about-intro-frame ${showTopFrame ? 'fade-in-top' : ''}`}>
          <h1 className="about-title">About Me</h1>
          <p className="about-intro-text">
            I'm a second-year Business Administration student concentrating in
            Marketing with a minor in Photography and Videography at Cal Poly San Luis Obispo.
            During my time at school, I've been working as a videographer for Cal Poly Athletics,
            filming coverage for all Division I ESPN livestreams as well as getting footage for
            social media and pregame edits. Through courses for my minor, my association in
            my school's fashion club, and personal interest, I have worked with and photographed
            many different subjects and activities, using a variety of skills and techniques.
          </p>
        </div>

        {/* Second major frame - Photo and Bio/Work section */}
        <div className={`about-details-frame ${showBottomFrame ? 'fade-in-bottom' : ''}`}>
          <div className="about-image">
            <img src="/photos/mari.jpg" alt="Mari" />
          </div>
          <div className="about-info-section">
            <h2 className="section-title">Bio</h2>
            <div className="info-text-frame">
              <div className="info-item">
                <span className="info-label">Hometown</span> : Austin, TX
              </div>
              <div className="info-item">
                <span className="info-label">School</span> : Cal Poly San Luis Obispo
              </div>
              <div className="info-item">
                <span className="info-label">Year</span> : Sophomore
              </div>
              <div className="info-item">
                <span className="info-label">Major</span> : Business
              </div>
              <div className="info-item">
                <span className="info-label">Minor</span> : Photography and Videography
              </div>
              <div className="info-item">
                <span className="info-label">Favorite Camera</span> : Nikon D3500
              </div>
            </div>
            <h2 className="section-title">Work</h2>
            <div className="info-text-frame work-info">
              <div>Cal Poly FITS</div>
              <div>MeerMutter Label</div>
              <div>ART 122</div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="about-contact-section" ref={footerRef}>
          <div className={`about-together ${footerVisible ? 'fade-in-up' : ''}`}>
            <h2 className="about-heading">
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
      </div>
    </div>
  );
}

export default About;
