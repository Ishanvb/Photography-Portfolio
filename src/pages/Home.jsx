import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { markLoaded, setContentReady } from '~/store/uiSlice';
import useContent from '~/hooks/useContent';
import { setManualScrolling } from '~/store/scrollSlice';
import Header from '~/components/Header';
import Title from '~/components/Title';
import Reel from '~/components/Reel';
import ScrollReel from '~/components/ScrollReel';
import GalleryView from '~/components/GalleryView';
import { collectPhotos, preloadPhotos } from '~/content/photos';
import LoadingScreen from '~/components/LoadingScreen';
import * as S from './Home.styled';

// Track if site has been loaded this session (persists across navigation)
const hasLoadedKey = 'mariPortfolioLoaded';

// How long the gallery stays mounted after closing, so it can fade out first.
const GALLERY_EXIT_MS = 500;

function Home() {
  const dispatch = useDispatch();
  const content = useContent();
  const { reel } = content;
  const { isFirstVisit, isLoading, contentReady } = useSelector((state) => state.ui);

  // Every photo the site owns, in the order the gallery walks them.
  const photos = useMemo(() => collectPhotos(content), [content]);

  const [instructionVisible, setInstructionVisible] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryMounted, setGalleryMounted] = useState(false);
  // The project the gallery's centre photo belongs to — the title reads it.
  const [galleryProject, setGalleryProject] = useState('');
  const reelRef = useRef(null);
  const scrollReelRef = useRef(null);
  const preloadedRef = useRef(false);
  const galleryLabelRef = useRef(null);
  // How far the gallery button rises in gallery view to sit level with the
  // bottom of the title.
  const [galleryLift, setGalleryLift] = useState(0);

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

  // Keep the gallery mounted through its closing animation.
  useEffect(() => {
    if (galleryOpen) {
      setGalleryMounted(true);
      return;
    }
    if (!galleryMounted) return;
    const timer = setTimeout(() => setGalleryMounted(false), GALLERY_EXIT_MS);
    return () => clearTimeout(timer);
  }, [galleryOpen, galleryMounted]);

  // In gallery view the button lines its bottom up with the title's — the
  // bottom of the highlight behind the collection name.
  useLayoutEffect(() => {
    if (!galleryOpen) {
      setGalleryLift(0);
      return;
    }
    const measure = () => {
      const label = galleryLabelRef.current;
      const line = document.querySelector('[data-title-anchor] h1');
      if (!label || !line) return;
      // The first letter cell: its box is the line's, not the font's.
      const cell = line.querySelector(':scope > span > span') ?? line;
      const fontSize = parseFloat(getComputedStyle(line).fontSize);
      const titleBottom = cell.getBoundingClientRect().bottom - fontSize * 0.17;
      // The wrapper is never moved, so it still marks the button's resting place.
      setGalleryLift(Math.max(0, label.getBoundingClientRect().bottom - titleBottom));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [galleryOpen]);

  // Escape leaves the gallery.
  useEffect(() => {
    if (!galleryOpen) return;
    const handleKey = (event) => {
      if (event.key === 'Escape') setGalleryOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [galleryOpen]);

  // Revealing the gallery button is the earliest hint that every photo on the
  // site is about to be needed — start warming them a few at a time.
  const handleLabelHover = useCallback(() => {
    if (preloadedRef.current) return;
    preloadedRef.current = true;
    preloadPhotos(photos);
  }, [photos]);

  const toggleGallery = useCallback(() => setGalleryOpen((open) => !open), []);
  const closeGallery = useCallback(() => setGalleryOpen(false), []);

  // Called after the loading screen fades out. Memoised: LoadingScreen holds a
  // timer keyed on this callback, and a fresh identity each render would keep
  // restarting it.
  const handleFadeComplete = useCallback(() => {
    dispatch(setContentReady(true));
    setTimeout(() => setInstructionVisible(true), 300);
  }, [dispatch]);

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

  // The gallery reports which photo is in the middle; only its project reaches
  // React, so scrolling past photos from the same project re-renders nothing.
  const handleGalleryCentre = useCallback((photo) => {
    setGalleryProject(photo?.project ?? photo?.title ?? '');
  }, []);

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
        <Header onHomeClick={galleryOpen ? closeGallery : undefined} />
        <S.TitleLayer>
          <Title
            startAnimation={contentReady}
            gallery={galleryOpen}
            project={galleryProject}
          />
        </S.TitleLayer>
        <S.ReelWrapper $galleryOpen={galleryOpen || galleryMounted}>
          {/* Gallery toggle - desktop only */}
          <S.SelectedWorksLabel ref={galleryLabelRef}>
            <S.SelectedWorksText
              type="button"
              onClick={toggleGallery}
              onMouseEnter={handleLabelHover}
              aria-label={galleryOpen ? 'Close the gallery' : 'Open the gallery'}
              $isVisible={instructionVisible}
              $active={galleryOpen}
              $lift={galleryLift}
              data-cursor={galleryOpen ? '* VIEW ALL' : 'GALLERY VIEW'}
              data-cursor-variant="merge"
            >
              {/* Holds the widest of the four labels, so the chip never resizes. */}
              <S.SelectedWorksSizer aria-hidden="true">GALLERY VIEW</S.SelectedWorksSizer>
              <S.SelectedWorksInner>
                {galleryOpen ? 'CLOSE' : '* VIEW ALL'}
              </S.SelectedWorksInner>
              <S.SelectedWorksCover aria-hidden="true">
                {galleryOpen ? (
                  <S.SelectedWorksClose />
                ) : (
                  <S.SelectedWorksCoverInner>GALLERY VIEW</S.SelectedWorksCoverInner>
                )}
              </S.SelectedWorksCover>
            </S.SelectedWorksText>
          </S.SelectedWorksLabel>
          {/* Instruction bar - mobile only */}
          <S.GalleryInstruction $isVisible={instructionVisible}>
            <S.InstructionText>DRAG TO EXPLORE</S.InstructionText>
            <S.InstructionText>SELECT TO VIEW</S.InstructionText>
          </S.GalleryInstruction>
          <S.ReelLayer $hidden={galleryOpen}>
            <Reel
              ref={reelRef}
              onScrollUpdate={handleScrollUpdate}
              onWheelScroll={handleWheelScroll}
              startAnimation={contentReady && !galleryOpen}
            />
          </S.ReelLayer>
          {/* The gallery's thumbnail strip stands in the block's place. */}
          <S.ScrollReelLayer $hidden={galleryOpen}>
            <ScrollReel
              ref={scrollReelRef}
              isFixed
              onManualScroll={handleManualScroll}
            />
          </S.ScrollReelLayer>
        </S.ReelWrapper>
        {galleryMounted && (
          <GalleryView
            active={galleryOpen}
            photos={photos}
            onCentreChange={handleGalleryCentre}
          />
        )}
      </S.Container>
    </>
  );
}

export default Home;
