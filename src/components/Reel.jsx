import {
  useEffect,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import OptimizedImage from '~/components/OptimizedImage';
import useContent from '~/hooks/useContent';
import * as S from './Reel.styled';

/* =========================
   Helpers
========================= */

const isMobile = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: none) and (pointer: coarse)').matches;

// Get responsive gap to match styled-component media queries
const getResponsiveGap = () => {
  if (typeof window === 'undefined') return 32;
  const width = window.innerWidth;
  if (width <= 480) return 12;
  if (width <= 768) return 16;
  return 32;
};

/* =========================
   Layout
========================= */

// The track renders the reel six times over so the auto-scroll can loop
// seamlessly without ever hitting an edge.
const LOOPS = 6;

/* =========================
   Component
========================= */

const Reel = forwardRef(function Reel(
  { onScrollUpdate, onWheelScroll, startAnimation = true },
  ref
) {
  const navigate = useNavigate();
  const { reel } = useContent();
  const isManualScrolling = useSelector((state) => state.scroll.isManualScrolling);

  const duplicatedImages = useMemo(
    () => Array.from({ length: LOOPS }, () => reel).flat(),
    [reel]
  );
  const cycleCount = reel.length;
  const reelRef = useRef(null);
  const animationRef = useRef(null);
  const scrollPosRef = useRef(0);
  const cycleLengthRef = useRef(0);
  const startTimeRef = useRef(null);

  const initialSpeed = 40;
  const normalSpeed = 1;
  const transitionDuration = 3000;

  /* =========================
     Init cycle length
  ========================= */

  useEffect(() => {
    const reel = reelRef.current;
    if (!reel) return;

    requestAnimationFrame(() => {
      const frames = reel.children;
      const gap = getResponsiveGap();
      let length = 0;

      for (let i = 0; i < cycleCount && i < frames.length; i++) {
        length += frames[i].offsetWidth + gap;
      }

      cycleLengthRef.current = length;
      reel.scrollLeft = 0;
      scrollPosRef.current = 0;
    });
  }, [cycleCount]);

  /* =========================
     Imperative API
  ========================= */

  useImperativeHandle(ref, () => ({
    getScrollPosition: () => scrollPosRef.current,
    getCycleLength: () => cycleLengthRef.current
  }));

  /* =========================
     Desktop Auto Scroll
  ========================= */

  useEffect(() => {
    // Don't start until animation is triggered, and only on desktop
    if (!startAnimation || isManualScrolling || isMobile()) return;

    const reel = reelRef.current;
    if (!reel) return;

    // Only initialize once when animation first begins
    if (startTimeRef.current === null) {
      // Recalculate cycle length from actual DOM to ensure accuracy
      // (the mount-time calculation may be stale if delayed by loading screen)
      const frames = reel.children;
      const gap = getResponsiveGap();
      let length = 0;
      for (let i = 0; i < cycleCount && i < frames.length; i++) {
        length += frames[i].offsetWidth + gap;
      }
      cycleLengthRef.current = length;

      // Reset to clean starting position
      scrollPosRef.current = 0;
      reel.scrollLeft = 0;

      startTimeRef.current = Date.now();
    }

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / transitionDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 2);

      const speed =
        elapsed < transitionDuration
          ? initialSpeed - (initialSpeed - normalSpeed) * eased
          : normalSpeed;

      scrollPosRef.current += speed;

      const cycle = cycleLengthRef.current;
      if (scrollPosRef.current >= cycle) {
        scrollPosRef.current = scrollPosRef.current % cycle;
      }

      reel.scrollLeft = scrollPosRef.current;

      const cycleProgress = cycle > 0 ? (scrollPosRef.current % cycle) / cycle : 0;
      onScrollUpdate?.(cycleProgress, cycle);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [startAnimation, isManualScrolling, onScrollUpdate, cycleCount]);

  /* =========================
     Desktop Wheel Scroll
  ========================= */

  useEffect(() => {
    if (isMobile()) return;

    const reel = reelRef.current;
    if (!reel) return;

    let wheelTimeout = null;

    const handleWheel = (e) => {
      e.preventDefault();

      // Update scroll position based on wheel delta
      scrollPosRef.current += e.deltaX || e.deltaY;

      const cycle = cycleLengthRef.current;
      if (scrollPosRef.current < 0) {
        scrollPosRef.current = cycle + (scrollPosRef.current % cycle);
      } else if (scrollPosRef.current >= cycle) {
        scrollPosRef.current = scrollPosRef.current % cycle;
      }

      reel.scrollLeft = scrollPosRef.current;

      const cycleProgress = cycle > 0 ? (scrollPosRef.current % cycle) / cycle : 0;
      onWheelScroll?.(true, cycleProgress);

      // Clear previous timeout and set new one to resume auto-scroll
      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        onWheelScroll?.(false, null);
      }, 1500);
    };

    reel.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      reel.removeEventListener('wheel', handleWheel);
      clearTimeout(wheelTimeout);
    };
  }, [onWheelScroll]);

  /* =========================
     Mobile Touch/Drag Only (No Auto Scroll)
  ========================= */

  useEffect(() => {
    if (!isMobile()) return;

    const reel = reelRef.current;
    if (!reel) return;

    // Track scroll position updates for the scroll reel indicator
    const handleScroll = () => {
      scrollPosRef.current = reel.scrollLeft;
      const cycle = cycleLengthRef.current;
      const cycleProgress = cycle > 0 ? (reel.scrollLeft % cycle) / cycle : 0;
      onScrollUpdate?.(cycleProgress, cycle);
    };

    reel.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      reel.removeEventListener('scroll', handleScroll);
    };
  }, [onScrollUpdate]);

  /* =========================
     Image Handling
  ========================= */

  // A photo in the reel opens the same collection pop-up the Work page opens,
  // over the Work page — so closing it leaves you in Work rather than back here.
  const handleImageClick = (item) => {
    if (!item.targetSlug) return;
    navigate('/work', {
      state: {
        openCollection: { slug: item.targetSlug, photoIndex: item.targetPhotoIndex ?? 0 }
      }
    });
  };

  /* =========================
     Render
  ========================= */

  return (
    <S.Container>
      <S.Track ref={reelRef}>
        {duplicatedImages.map((img, index) => (
          <S.Frame $isNarrow={img.isNarrow} key={`${img.jpg}-${index}`}>
            <S.ImageContainer
              $isNarrow={img.isNarrow}
              data-cursor="View Photo"
              onClick={() => handleImageClick(img)}
            >
              <OptimizedImage
                src={img.jpg}
                webpSrc={img.webp}
                loading="lazy"
                alt={img.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </S.ImageContainer>
          </S.Frame>
        ))}
      </S.Track>
    </S.Container>
  );
});

export default Reel;
