import { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { markLoaded, setContentReady } from '~/store/uiSlice';
import useContent from '~/hooks/useContent';
import { setManualScrolling } from '~/store/scrollSlice';
import Header from '~/components/Header';
import Title from '~/components/Title';
import Reel from '~/components/Reel';
import ScrollReel from '~/components/ScrollReel';
import LoadingScreen from '~/components/LoadingScreen';
import * as S from './Home.styled';

// Track if site has been loaded this session (persists across navigation)
const hasLoadedKey = 'mariPortfolioLoaded';

function Home() {
  const dispatch = useDispatch();
  const { reel } = useContent();
  const { isFirstVisit, isLoading, contentReady } = useSelector((state) => state.ui);

  const [instructionVisible, setInstructionVisible] = useState(false);
  const reelRef = useRef(null);
  const scrollReelRef = useRef(null);

  // Preload all key images on initial site load
  useEffect(() => {
    if (!isFirstVisit) {
      setTimeout(() => {
        setInstructionVisible(true);
      }, 300);
      return;
    }

    // Preload exactly what the reel is about to render, in order.
    const imagesToPreload = reel.map((item) => item.webp ?? item.jpg).filter(Boolean);

    const onImagesLoaded = () => {
      sessionStorage.setItem(hasLoadedKey, 'true');
      dispatch(markLoaded());
    };

    let loadedCount = 0;
    const totalImages = imagesToPreload.length;

    // Nothing to wait for (empty reel) — do not hold the loading screen open.
    if (totalImages === 0) {
      onImagesLoaded();
      return;
    }

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

    const fallbackTimer = setTimeout(onImagesLoaded, 5000);
    return () => clearTimeout(fallbackTimer);
  }, [isFirstVisit, dispatch, reel]);

  // Called after loading screen fade-out completes
  const handleFadeComplete = () => {
    dispatch(setContentReady(true));
    setTimeout(() => {
      setInstructionVisible(true);
    }, 300);
  };

  // Called at 60fps from Reel auto-scroll — updates ScrollReel imperatively, NO React state
  const handleScrollUpdate = useCallback((progress) => {
    scrollReelRef.current?.updateProgress(progress);
  }, []);

  const handleManualScroll = useCallback((isManual, progress = null) => {
    dispatch(setManualScrolling(isManual));
    if (isManual && progress !== null) {
      scrollReelRef.current?.updateProgress(progress);
    }
  }, [dispatch]);

  const handleWheelScroll = useCallback((isManual, progress) => {
    dispatch(setManualScrolling(isManual));
    if (isManual && progress !== null) {
      scrollReelRef.current?.updateProgress(progress);
    }
  }, [dispatch]);

  return (
    <>
      {isFirstVisit && <LoadingScreen isLoading={isLoading} onFadeComplete={handleFadeComplete} />}
      <S.Container $contentReady={contentReady} data-name="Home" data-node-id="1:3">
        <Header />
        <Title startAnimation={contentReady} />
        <S.ReelWrapper>
          {/* Selected Works label - desktop only */}
          <S.SelectedWorksLabel>
            <S.SelectedWorksText $isVisible={instructionVisible}>
              <S.SelectedWorksInner>* SELECTED WORKS</S.SelectedWorksInner>
            </S.SelectedWorksText>
          </S.SelectedWorksLabel>
          {/* Instruction bar - mobile only */}
          <S.GalleryInstruction $isVisible={instructionVisible}>
            <S.InstructionText>DRAG TO EXPLORE</S.InstructionText>
            <S.InstructionText>SELECT TO VIEW</S.InstructionText>
          </S.GalleryInstruction>
          <Reel
            ref={reelRef}
            onScrollUpdate={handleScrollUpdate}
            onWheelScroll={handleWheelScroll}
            startAnimation={contentReady}
          />
          <ScrollReel
            ref={scrollReelRef}
            isFixed
            onManualScroll={handleManualScroll}
          />
        </S.ReelWrapper>
      </S.Container>
    </>
  );
}

export default Home;
