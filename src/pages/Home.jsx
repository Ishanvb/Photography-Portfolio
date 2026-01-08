import { useState, useRef } from 'react';
import Header from '../components/Header';
import Title from '../components/Title';
import Reel from '../components/Reel';
import ScrollReel from '../components/ScrollReel';
import './Home.css';

function Home() {
  const [cycleProgress, setCycleProgress] = useState(0);
  const [cycleLength, setCycleLength] = useState(0);
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const [manualScrollPosition, setManualScrollPosition] = useState(null);
  const reelRef = useRef(null);

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
    <div className="home" data-name="Home" data-node-id="1:3">
      <Header />
      <Title />
      <div className="reel-wrapper">
        <Reel 
          ref={reelRef}
          onScrollUpdate={handleScrollUpdate}
          isManualScrolling={isManualScrolling}
          manualScrollPosition={manualScrollPosition}
          onWheelScroll={handleWheelScroll}
        />
        <ScrollReel
          className="fixed-bottom-scroll-reel"
          cycleProgress={cycleProgress}
          onManualScroll={handleManualScroll}
          isManualScrolling={isManualScrolling}
        />
      </div>
    </div>
  );
}

export default Home;

