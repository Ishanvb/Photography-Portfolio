import { useState, useEffect, useRef } from 'react';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import OptimizedImage from '~/components/OptimizedImage';
import '~/pages/VideographyProject.css';

function VideographyProject() {
  // Header animation states
  const [headerAnimations, setHeaderAnimations] = useState({
    date: false,
    image: false,
    title: false,
    body: false
  });

  const playerRefs = useRef([null, null, null]);

  // YouTube video IDs
  const youtubeVideos = [
    { id: 'ItjDChITeqY' },
    { id: 'bibYaiWGmMA' },
    { id: 'TY5KktQdBeU' }
  ];

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      youtubeVideos.forEach((video, index) => {
        playerRefs.current[index] = new window.YT.Player(`youtube-player-${index}`, {
          videoId: video.id,
          playerVars: {
            controls: 1,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            playsinline: 1,
            fs: 1,
            disablekb: 0,
            cc_load_policy: 0,
            origin: window.location.origin
          }
        });
      });
    };

    // If API already loaded, initialize players
    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }
  }, []);

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
    <div className="videography-project">
      <Header />

      {/* Main Container */}
      <section className="main-container">
        {/* Date Frame */}
        <div className={`date-frame ${headerAnimations.date ? 'fade-in-up-quick' : ''}`}>
          <div className="date-text">[ Photo Collections: 3 ]</div>
        </div>

        {/* Content Frame */}
        <div className="content-frame">
          {/* Left Frame - Image with Title Overlay */}
          <div className="image-title-frame">
            <OptimizedImage src="/photos/Videography/videography.jpg" alt="Videography" className={`videography-image ${headerAnimations.image ? 'fade-in-up-quick' : ''}`} />
            <h1 className={`videography-title ${headerAnimations.title ? 'fade-in-up-long' : ''}`}>Videography</h1>
          </div>

          {/* Right Frame - Body Text */}
          <div className={`body-text ${headerAnimations.body ? 'fade-in-up-quick' : ''}`}>
            My videography is often in collaboration with other artists to help portray their art visually.
            I attempt to capture the essence of artists' music through video by using a variety of techniques,
            pacing, framing, editing, and even cameras. These videos are used for social media promotion and
            Spotify to appeal to audiences who may resonate with the video and feel more inclined to look into
            the associated music. My videography is also used to promote Cal Poly's fashion club, FITS, and
            their related campaigns by using video to highlight clothing using a more fashion and lifestyle approach.
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section">
        {youtubeVideos.map((video, index) => (
          <div key={index} className="gallery-item">
            <div className="gallery-video-container">
              <div className="youtube-wrapper">
                <div id={`youtube-player-${index}`} className="youtube-player"></div>
                <div
                  className="youtube-cursor-overlay"
                  data-cursor-youtube
                  onClick={() => {
                    const player = playerRefs.current[index];
                    if (player && player.getPlayerState) {
                      const state = player.getPlayerState();
                      if (state === 1) {
                        player.pauseVideo();
                      } else {
                        player.playVideo();
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ))}

      </section>
      <Footer />
    </div>
  );
}

export default VideographyProject;
