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
  const scrollPosRef = useRef(0);
  const cycleLengthRef = useRef(0);
  const startTimeRef = useRef(null);

  const initialSpeed = 40;
  const normalSpeed = 1;
  const transitionDuration = 3000;

  // Wheel scrolling: how long the strip takes to catch up with the wheel, and
  // how long after the last wheel event auto-scroll picks up again.
  const WHEEL_FOLLOW_MS = 90;
  const WHEEL_RESUME_MS = 1500;

  /* =========================
     Cycle length
  ========================= */

  /**
   * The distance from the first photo to the first photo of the next copy of
   * the list — read straight off the layout, so it is exact to the subpixel.
   * Summing rounded widths plus an assumed gap drifted, and the strip visibly
   * jumped each time it wrapped.
   */
  const measureCycle = () => {
    const track = reelRef.current;
    if (!track) return;
    const frames = track.children;
    if (cycleCount > 0 && frames.length > cycleCount) {
      cycleLengthRef.current =
        frames[cycleCount].getBoundingClientRect().left - frames[0].getBoundingClientRect().left;
    } else {
      const gap = getResponsiveGap();
      let length = 0;
      for (let i = 0; i < cycleCount && i < frames.length; i++) {
        length += frames[i].offsetWidth + gap;
      }
      cycleLengthRef.current = length;
    }
  };

  useEffect(() => {
    const track = reelRef.current;
    if (!track) return;

    requestAnimationFrame(() => {
      measureCycle();
      track.scrollLeft = 0;
      scrollPosRef.current = 0;
    });

    // The photos are sized off the viewport, so a resize changes the cycle.
    const observer = new ResizeObserver(() => measureCycle());
    observer.observe(track);
    return () => observer.disconnect();
    // Keyed on the photos themselves, not just their count: fresher content can
    // arrive after the first render (see content/index.js) with different widths.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reel, cycleCount]);

  /* =========================
     Imperative API
  ========================= */

  useImperativeHandle(ref, () => ({
    getScrollPosition: () => scrollPosRef.current,
    getCycleLength: () => cycleLengthRef.current
  }));

  /* =========================
     Desktop: auto-scroll and wheel, one loop
  ========================= */

  // Read from the loop, which is never torn down just because the reel was
  // paused or a wheel scroll began — restarting it through React is what made
  // each hand-over hitch.
  const startRef = useRef(startAnimation);
  const heldRef = useRef(isManualScrolling);
  useEffect(() => {
    startRef.current = startAnimation;
  }, [startAnimation]);
  useEffect(() => {
    heldRef.current = isManualScrolling;
  }, [isManualScrolling]);

  useEffect(() => {
    if (isMobile()) return;
    const track = reelRef.current;
    if (!track) return;

    let raf = 0;
    let last = 0;
    let wheeling = false;  // the wheel owns the strip until it has been still a while
    let wheelTarget = 0;   // where the wheel has asked the strip to be
    let resumeTimer = 0;

    const frame = (now) => {
      const dt = last ? Math.min(now - last, 50) : 16;
      last = now;
      const cycle = cycleLengthRef.current;
      let pos = scrollPosRef.current;

      if (wheeling) {
        // Eased toward the wheel, frame-rate independent: trackpads deliver
        // deltas in uneven bursts, and applying each one directly made the
        // strip lurch between them.
        pos += (wheelTarget - pos) * (1 - Math.exp(-dt / WHEEL_FOLLOW_MS));
        if (Math.abs(wheelTarget - pos) < 0.1) pos = wheelTarget;
      } else if (startRef.current && !heldRef.current) {
        // Only initialize once when animation first begins
        if (startTimeRef.current === null) {
          measureCycle();
          pos = 0;
          startTimeRef.current = Date.now();
        }
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(elapsed / transitionDuration, 1);
        const eased = 1 - Math.pow(1 - progress, 2);
        pos +=
          elapsed < transitionDuration
            ? initialSpeed - (initialSpeed - normalSpeed) * eased
            : normalSpeed;
      }

      // Wrap by whole cycles, moving the wheel's target with the strip so the
      // two stay in the same frame of reference.
      if (cycle > 0) {
        if (pos >= cycle) {
          pos -= cycle;
          wheelTarget -= cycle;
        } else if (pos < 0) {
          pos += cycle;
          wheelTarget += cycle;
        }
      }

      if (pos !== scrollPosRef.current) {
        scrollPosRef.current = pos;
        track.scrollLeft = pos;
        onScrollUpdate?.(cycle > 0 ? pos / cycle : 0, cycle);
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const handleWheel = (e) => {
      e.preventDefault();
      // Summed, not whichever axis is non-zero: in a slightly diagonal swipe
      // the small sideways delta used to win and the strip caught and stalled.
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? track.clientWidth : 1;
      const delta = (e.deltaX + e.deltaY) * unit;
      if (!delta) return;

      if (!wheeling) {
        wheeling = true;
        wheelTarget = scrollPosRef.current;
        onWheelScroll?.(true, null);
      }
      wheelTarget += delta;

      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        wheeling = false;
        onWheelScroll?.(false, null);
      }, WHEEL_RESUME_MS);
    };

    track.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resumeTimer);
      track.removeEventListener('wheel', handleWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onScrollUpdate, onWheelScroll]);

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
