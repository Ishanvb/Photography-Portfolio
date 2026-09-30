import {
  useEffect,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState
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
   Speed
========================= */

// In pixels per millisecond, so the strip covers the same ground per second on
// a 60Hz screen as on a 120Hz one, and a late frame is caught up rather than
// showing up as a stall.
const NORMAL_SPEED = 0.08;
// The strip starts at its top speed and eases down to its normal pace over
// RAMP_MS, covering about RAMP_SHARE of the reel on the way.
const RAMP_MS = 3000;
const RAMP_SHARE = 0.32;

/**
 * The top speed that carries the strip RAMP_SHARE of the way through a reel
 * `cycle` px long. The ease down (quadratic, to NORMAL_SPEED) averages a third
 * of the top plus two thirds of the end.
 */
const topSpeedFor = (cycle) =>
  Math.max(NORMAL_SPEED, (3 * RAMP_SHARE * cycle) / RAMP_MS - 2 * NORMAL_SPEED);

/**
 * How far the strip has come `elapsed` ms into the ramp: the integral of a
 * speed that eases out quadratically from `top` to NORMAL_SPEED, then holds.
 */
const rampDistance = (elapsed, top) => {
  const t = Math.min(elapsed, RAMP_MS);
  const p = t / RAMP_MS;
  // ∫ top - (top - N)(1 - (1 - p)²) dt  =  N·t + (top - N)·RAMP_MS·(1 - (1 - p)³) / 3
  const ramp = NORMAL_SPEED * t + ((top - NORMAL_SPEED) * RAMP_MS * (1 - Math.pow(1 - p, 3))) / 3;
  return ramp + Math.max(0, elapsed - RAMP_MS) * NORMAL_SPEED;
};

/**
 * The ramp as a CSS easing curve. Its distance over time is a cubic in the
 * ramp's progress p — N·T·p + K·(3p − 3p² + p³), with K = (top − N)·T / 3 — and
 * a cubic-bezier with its x handles at 1/3 and 2/3 is exactly such a cubic, so
 * the browser plays the true curve rather than an approximation of it.
 */
const rampEasing = (top) => {
  const nt = NORMAL_SPEED * RAMP_MS;
  const k = ((top - NORMAL_SPEED) * RAMP_MS) / 3;
  const total = nt + k;
  const y1 = (nt + 3 * k) / (3 * total);
  const y2 = (2 * nt + 3 * k) / (3 * total);
  return `cubic-bezier(${1 / 3}, ${y1}, ${2 / 3}, ${y2})`;
};

// The photos are decoded before the strip first moves (see below), but it
// never waits longer than this for them.
const DECODE_WAIT_MS = 1200;

const at = (x) => ({ transform: `translate3d(${-x}px, 0, 0)` });

/* =========================
   Motion
========================= */

/**
 * The auto-scroll runs as browser animations of transforms, not as a script
 * moving the strip frame by frame. The browser plays them on the compositor,
 * so the strip keeps an even pace however busy the page is — a photo decoding
 * or React re-rendering no longer costs it a frame.
 *
 * A run is the ramp (only on the very first start) and then an endless loop at
 * NORMAL_SPEED, one cycle of the reel per iteration; because the photos repeat
 * every cycle, the jump back at the end of each iteration cannot be seen.
 *
 * The two are on two elements — the ramp on the carriage, the loop on the belt
 * inside it — and their offsets add up. They must not share one: Chrome only
 * hands an element's transform to the compositor when it has a single transform
 * animation, and with both on the belt the whole reel quietly fell back to the
 * main thread and skipped frames in the intro.
 *
 * `position()` says where the strip is at any moment of the run, for the
 * progress bar and for handing over to the wheel. A run can be started
 * `elapsed` ms in, to pick a ramp back up where it was stopped.
 */
const startRun = (carriage, belt, from, cycle, top, elapsed = 0) => {
  const withRamp = top !== null;
  const rampEnd = withRamp ? rampDistance(RAMP_MS, top) : 0;
  const loopMs = cycle > 0 ? cycle / NORMAL_SPEED : Infinity;
  const delay = withRamp ? RAMP_MS : 0;

  const animations = [];
  if (withRamp) {
    // Holds where it ends, for the loop to carry on from.
    animations.push(carriage.animate([at(0), at(rampEnd)], {
      duration: RAMP_MS,
      easing: rampEasing(top),
      fill: 'forwards',
    }));
  }
  // Holds the belt where it starts until the ramp is done, then takes over at
  // exactly the speed the ramp ends on.
  const loop = belt.animate([at(from), at(from + cycle)], {
    duration: loopMs,
    delay,
    iterations: Infinity,
    easing: 'linear',
    fill: 'backwards',
  });
  animations.push(loop);
  if (elapsed) animations.forEach((a) => { a.currentTime = elapsed; });

  const posAt = (t) => {
    const x = t < delay
      ? from + rampDistance(t, top)
      : from + rampEnd + (t - delay) * NORMAL_SPEED;
    return cycle > 0 ? x % cycle : x;
  };
  const now = () => loop.currentTime ?? 0;

  return {
    position: () => posAt(now()),
    // Where a ramp that is stopped now would have to pick up from, or null
    // once it is over.
    rampLeft: () => (withRamp && now() < RAMP_MS ? { from, top, elapsed: now() } : null),
    pause: () => animations.forEach((a) => a.pause()),
    play: () => animations.forEach((a) => a.play()),
    cancel: () => animations.forEach((a) => a.cancel()),
  };
};

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
  const carriageRef = useRef(null);
  const beltRef = useRef(null);
  const scrollPosRef = useRef(0);
  const cycleLengthRef = useRef(0);
  // Whether the auto-scroll has had its first start (and so its ramp) yet,
  // and a ramp that was stopped partway, to finish when it starts again.
  const startedRef = useRef(false);
  const rampRef = useRef(null);
  // Whether the photos are decoded, and so the strip is clear to start.
  const decodedRef = useRef(false);
  // On desktop the strip stays hidden until it is moving, so it never shows
  // standing still first: it appears already at full speed.
  const [rolling, setRolling] = useState(false);
  // The desktop motion's controls, for the effects outside it.
  const motionRef = useRef(null);

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
    const belt = beltRef.current;
    if (!belt) return;
    const frames = belt.children;
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

    // The loop is built for one cycle length, so when that changes — the
    // photos arriving, or a resize (they are sized off the viewport) — it is
    // rebuilt from wherever the strip is.
    const remeasure = () => {
      const before = cycleLengthRef.current;
      measureCycle();
      if (Math.abs(cycleLengthRef.current - before) > 0.5) motionRef.current?.remeasured();
    };

    const frame = requestAnimationFrame(() => {
      track.scrollLeft = 0;
      if (!startedRef.current) scrollPosRef.current = 0;
      remeasure();
    });

    const observer = new ResizeObserver(remeasure);
    observer.observe(beltRef.current ?? track);

    // A photo is decoded the first time it is drawn, and a large one takes the
    // browser 10ms or so — which, landing just as it slides in during the quick
    // start, showed as a hitch a moment after the strip began. So every photo
    // is decoded up front and the strip starts once they are (or after
    // DECODE_WAIT_MS, whichever comes first). The copies share the same files,
    // so one of each is enough.
    let live = true;
    const images = [...(beltRef.current?.querySelectorAll('img') ?? [])].slice(0, cycleCount);
    const decoded = Promise.all(images.map((img) => img.decode().catch(() => {})));
    const waited = new Promise((resolve) => setTimeout(resolve, DECODE_WAIT_MS));
    Promise.race([decoded, waited]).then(() => {
      if (!live || !images.length) return;
      decodedRef.current = true;
      motionRef.current?.remeasured();
    });

    return () => {
      live = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
    // Keyed on the photos themselves, not just their count: fresher content can
    // arrive after the first render (see content/index.js) with different widths.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reel, cycleCount]);

  /* =========================
     Imperative API
  ========================= */

  useImperativeHandle(ref, () => ({
    getScrollPosition: () => motionRef.current?.position() ?? scrollPosRef.current,
    getCycleLength: () => cycleLengthRef.current
  }));

  /* =========================
     Desktop: auto-scroll and wheel
  ========================= */

  useEffect(() => {
    if (isMobile()) return;
    const track = reelRef.current;
    const carriage = carriageRef.current;
    const belt = beltRef.current;
    if (!track || !carriage || !belt) return;

    let run = null;        // the auto-scroll's animations, while it has them
    let wheeling = false;  // the wheel owns the strip until it has been still a while
    let wheelPos = 0;      // where the strip is while the wheel has it
    let wheelTarget = 0;   // where the wheel has asked the strip to be
    let resumeTimer = 0;
    let raf = 0;
    let last = 0;
    let reported = null;

    const wrap = (x) => {
      const cycle = cycleLengthRef.current;
      return cycle > 0 ? ((x % cycle) + cycle) % cycle : x;
    };
    const position = () => (wheeling ? wrap(wheelPos) : run ? run.position() : scrollPosRef.current);

    const place = (x) => {
      belt.style.transform = `translate3d(${-x}px, 0, 0)`;
    };

    // The auto-scroll runs when the page wants it and nobody is holding it.
    // Both are handed in by sync(), from the effect below.
    let ready = false;
    let held = false;
    const wanted = () => ready && !held;

    const beginRun = () => {
      if (run || wheeling) return;
      measureCycle();
      const cycle = cycleLengthRef.current;
      // Nothing to loop over until the photos are laid out; remeasured()
      // starts it once they are.
      if (!(cycle > 0)) return;
      const first = !startedRef.current;
      if (first && !decodedRef.current) return;
      startedRef.current = true;
      const ramp = first ? { from: wrap(scrollPosRef.current), top: topSpeedFor(cycle), elapsed: 0 } : rampRef.current;
      rampRef.current = null;
      run = ramp
        ? startRun(carriage, belt, ramp.from, cycle, ramp.top, ramp.elapsed)
        : startRun(carriage, belt, wrap(scrollPosRef.current), cycle, null);
      place(run.position());
      if (!wanted()) run.pause();
      setRolling(true);
    };

    const endRun = () => {
      if (!run) return;
      rampRef.current = run.rampLeft();
      scrollPosRef.current = run.position();
      run.cancel();
      run = null;
      place(scrollPosRef.current);
    };

    const sync = (nextReady, nextHeld) => {
      ready = nextReady;
      held = nextHeld;
      if (wheeling) return;
      if (!run) {
        if (wanted()) beginRun();
        return;
      }
      if (wanted()) run.play();
      else run.pause();
    };

    // Only the progress bar is still fed from a frame loop; the photos
    // themselves move without it.
    const frame = (now) => {
      const dt = last ? Math.min(now - last, 50) : 16;
      last = now;
      if (wheeling) {
        // Eased toward the wheel, frame-rate independent: trackpads deliver
        // deltas in uneven bursts, and applying each one directly made the
        // strip lurch between them.
        wheelPos += (wheelTarget - wheelPos) * (1 - Math.exp(-dt / WHEEL_FOLLOW_MS));
        if (Math.abs(wheelTarget - wheelPos) < 0.1) wheelPos = wheelTarget;
        // Wrap by whole cycles, moving the target with the strip so the two
        // stay in the same frame of reference.
        const wrapped = wrap(wheelPos);
        wheelTarget += wrapped - wheelPos;
        wheelPos = wrapped;
        place(wheelPos);
      }
      const pos = position();
      if (pos !== reported) {
        reported = pos;
        scrollPosRef.current = pos;
        const cycle = cycleLengthRef.current;
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
        endRun();
        rampRef.current = null; // the wheel has taken over; no ramp to go back to
        wheeling = true;
        wheelPos = scrollPosRef.current;
        wheelTarget = wheelPos;
        onWheelScroll?.(true, null);
      }
      wheelTarget += delta;

      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        wheeling = false;
        scrollPosRef.current = wrap(wheelPos);
        onWheelScroll?.(false, null);
        if (startedRef.current) beginRun();
      }, WHEEL_RESUME_MS);
    };

    track.addEventListener('wheel', handleWheel, { passive: false });

    motionRef.current = {
      sync,
      position,
      // A new cycle length means a new loop, from wherever the strip is now.
      remeasured: () => {
        if (run) endRun();
        if (wanted()) beginRun();
      },
    };

    return () => {
      motionRef.current = null;
      cancelAnimationFrame(raf);
      clearTimeout(resumeTimer);
      endRun();
      track.removeEventListener('wheel', handleWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onScrollUpdate, onWheelScroll]);

  // Starts the auto-scroll once the page is ready for it, and pauses it while
  // the gallery is open or the progress bar is being dragged.
  useEffect(() => {
    motionRef.current?.sync(startAnimation, isManualScrolling);
  }, [startAnimation, isManualScrolling, onScrollUpdate, onWheelScroll]);

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
      <S.Track ref={reelRef} $waiting={!rolling && !isMobile()}>
        <S.Carriage ref={carriageRef}>
          <S.Belt ref={beltRef}>
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
                    // All fetched up front rather than as they come into view: the
                    // strip moves by transform, which the lazy-loader cannot be
                    // relied on to follow, and a photo arriving mid-flight used to
                    // hitch it. The copies are the same few files, fetched once.
                    loading="eager"
                    alt={img.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </S.ImageContainer>
              </S.Frame>
            ))}
          </S.Belt>
        </S.Carriage>
      </S.Track>
    </S.Container>
  );
});

export default Reel;
