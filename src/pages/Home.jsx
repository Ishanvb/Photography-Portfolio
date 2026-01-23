import { useState, useRef, useEffect } from 'react';
import Header from '~/components/Header';
import Title from '~/components/Title';
import Reel from '~/components/Reel';
import ScrollReel from '~/components/ScrollReel';
import LoadingScreen from '~/components/LoadingScreen';
import '~/pages/Home.css';

// Track if site has been loaded this session (persists across navigation)
const hasLoadedKey = 'mariPortfolioLoaded';

function Home() {
  // Only show loading screen on first visit this session
  const [isFirstVisit] = useState(() => !sessionStorage.getItem(hasLoadedKey));
  const [isLoading, setIsLoading] = useState(isFirstVisit);
  const [contentReady, setContentReady] = useState(!isFirstVisit); // Hide content until loading done
  const [cycleProgress, setCycleProgress] = useState(0);
  const [, setCycleLength] = useState(0);
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const [manualScrollPosition, setManualScrollPosition] = useState(null);
  const [instructionVisible, setInstructionVisible] = useState(false);
  const reelRef = useRef(null);

  // Preload all key images on initial site load
  useEffect(() => {
    // If not first visit, just show UI immediately
    if (!isFirstVisit) {
      setTimeout(() => {
        setInstructionVisible(true);
      }, 300);
      return;
    }

    // Preload WebP versions (what actually gets displayed)
    const imagesToPreload = [
      // Reel images (WebP)
      '/photos/reelphotos/mari1.webp',
      '/photos/reelphotos/mari8.webp',
      '/photos/reelphotos/mari3.webp',
      '/photos/reelphotos/mari4.webp',
      '/photos/reelphotos/mari5.webp',
      '/photos/reelphotos/mari6.webp',
      '/photos/reelphotos/mari7.webp',
      '/photos/reelphotos/mari2.webp'
    ];

    let loadedCount = 0;
    const totalImages = imagesToPreload.length;

    const onImagesLoaded = () => {
      // Mark as loaded for this session
      sessionStorage.setItem(hasLoadedKey, 'true');
      // This triggers the fade-out animation
      setIsLoading(false);
    };

    imagesToPreload.forEach(src => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount >= totalImages) {
          onImagesLoaded();
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount >= totalImages) {
          onImagesLoaded();
        }
      };
      img.src = src;
      if (img.complete) {
        loadedCount++;
        if (loadedCount >= totalImages) {
          onImagesLoaded();
        }
      }
    });

    // Fallback timeout in case images take too long
    const fallbackTimer = setTimeout(onImagesLoaded, 5000);
    return () => clearTimeout(fallbackTimer);
  }, [isFirstVisit]);

  // Called after loading screen fade-out completes
  const handleFadeComplete = () => {
    // Show content first
    setContentReady(true);
    // Then start animations after a brief buffer
    setTimeout(() => {
      setInstructionVisible(true);
    }, 300);
  };

  const handleScrollUpdate = (progress, length) => {
    if (!isManualScrolling) {
      setCycleProgress(progress);
      setCycleLength(length);
    }
  };

  const handleManualScroll = (isManual, cycleProgress = null) => {
    setIsManualScrolling(isManual);
    if (isManual && cycleProgress !== null) {
      setManualScrollPosition(cycleProgress);
      setCycleProgress(cycleProgress);
    } else {
      setManualScrollPosition(null);
    }
  };

  const handleWheelScroll = (isManual, cycleProgress) => {
    setIsManualScrolling(isManual);
    if (isManual && cycleProgress !== null) {
      setManualScrollPosition(cycleProgress);
      setCycleProgress(cycleProgress);
    } else {
      // Resume auto-scroll
      setManualScrollPosition(null);
    }
  };

  return (
    <>
      {isFirstVisit && <LoadingScreen isLoading={isLoading} onFadeComplete={handleFadeComplete} />}
      <div className={`home ${contentReady ? 'content-ready' : 'content-hidden'}`} data-name="Home" data-node-id="1:3">
        <Header />
        <Title startAnimation={contentReady} />
        <div className="reel-wrapper">
          {/* Selected Works label - desktop only */}
          <div className={`selected-works-label ${instructionVisible ? 'is-visible' : ''}`}>
            <span className="selected-works-text">
              <span>* SELECTED WORKS</span>
            </span>
          </div>
          {/* Instruction bar - mobile only */}
          <div className={`home-gallery-instruction ${instructionVisible ? 'is-visible' : ''}`}>
            <span className="home-instruction-text">DRAG TO EXPLORE</span>
            <span className="home-instruction-text">SELECT TO VIEW</span>
          </div>
          <Reel
            ref={reelRef}
            onScrollUpdate={handleScrollUpdate}
            isManualScrolling={isManualScrolling}
            manualScrollPosition={manualScrollPosition}
            onWheelScroll={handleWheelScroll}
            startAnimation={contentReady}
          />
          <ScrollReel
            className="fixed-bottom-scroll-reel"
            cycleProgress={cycleProgress}
            onManualScroll={handleManualScroll}
            isManualScrolling={isManualScrolling}
          />
        </div>
      </div>
    </>
  );
}

export default Home;
