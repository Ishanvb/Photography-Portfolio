import { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import useContent from '~/hooks/useContent';
import Header from '~/components/Header';
import { ContactStage } from '~/components/Footer';
import OptimizedImage from '~/components/OptimizedImage';
import ScrambleText from '~/components/ScrambleText';
import * as S from './About.styled';

// Step 0 is the title alone; each step after that adds a line. Once the
// biography is complete it holds for a step, then rolls into "Work"; the work
// lines follow and hold likewise, with a last step before the stage lets go.
// The lists are editable, so how many steps there are depends on their length.
const stepsFor = (bio, work) => {
  const workStart = bio.length + 2;
  const total = workStart + work.length + 2;
  const lastHeld = total - 2;
  // Where a scroll is allowed to come to rest. One gesture carries from one of
  // these to the next, so a single push plays a whole list in — the lines still
  // arrive one at a time, because the section walks toward the target rather
  // than jumping to it (see INFO_STEP_MS). The stops are: the title, the
  // finished biography, the roll over into Work, and the finished Work list.
  const stops = [0, bio.length, workStart, lastHeld];
  // The last step scrolling stops on: the finished Work list.
  return { workStart, total, lastHeld, stops };
};

// The fastest the Information section will move on by one line. A line's own
// reveal runs 0.6s, so this leaves it mostly settled before the next follows.
const INFO_STEP_MS = 280;
// A scroll gesture counts as new once the wheel has been quiet this long, or
// when it pushes harder mid-momentum; a wheel spun without let-up moves on
// again every GESTURE_REPEAT_MS (momentum only ever fades, so it never does).
const GESTURE_GAP_MS = 220;
const GESTURE_REPEAT_MS = 1100;
// A harder push part-way through momentum also counts, but it has to be a real
// one: this long since the last step, and this much bigger than the deltas
// already arriving.
const PUSH_AFTER_MS = 320;
const PUSH_SIZE = 28;
// Leaving the finished biography for Work is the one easy move: the reader has
// read it and is waiting to move on.
const LAST_LINE_EASE = 0.65;
// The finished Work list is the opposite. It holds the screen for this long
// before any scroll can release it, so the last lines are actually read rather
// than flicked past, and the footer that follows arrives as its own moment.
const RELEASE_DWELL_MS = 900;

// How far a finger has to travel inside the section to count as one step.
const TOUCH_REACH = 42;

function About() {
  const { about } = useContent();
  // Memoised so the fallback [] does not make a new array every render, which
  // would ripple through the stops and rebind every scroll listener.
  const bioItems = useMemo(() => about?.bio ?? [], [about]);
  const workItems = useMemo(() => about?.work ?? [], [about]);
  // Memoised: the stops are an array, and the scroll listeners depend on it —
  // a fresh one each render would rebind them all every time.
  const { workStart: WORK_START, total: INFO_STEPS, lastHeld: LAST_HELD_STEP, stops: STOPS } =
    useMemo(() => stepsFor(bioItems, workItems), [bioItems, workItems]);

  const [showContent, setShowContent] = useState(false);
  const [photosVisible, setPhotosVisible] = useState(false);
  // Where the scroll says the section is, and where it is actually showing.
  // The second follows the first one step at a time (see below).
  const [scrollStep, setScrollStep] = useState(-1);
  const [infoStep, setInfoStep] = useState(-1);
  const [infoNearTop, setInfoNearTop] = useState(false);
  const [stepPx, setStepPx] = useState(240);
  const [infoDone, setInfoDone] = useState(false);
  const bodyTextRef = useRef(null);
  const infoScrollRef = useRef(null);
  const infoBottomRef = useRef(null);
  const lastInfoMoveRef = useRef(0);
  const photosRef = useRef(null);


  useEffect(() => {
    setShowContent(true);
  }, []);



  // Photos fade in when scrolled into view
  useEffect(() => {
    // Photos fade in
    const photosObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setPhotosVisible(true);
            photosObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (photosRef.current) {
      photosObserver.observe(photosRef.current);
    }

    return () => {
      photosObserver.disconnect();
    };
  }, [showContent]);

  // Information section: the stage pins to the top of the screen and every
  // `stepPx` of scroll past that point advances one step — one more line drops
  // in, or the title rolls over into the next word. Scrolling back reverses it,
  // until the section has played through: once it is off the top of the screen
  // (or the page has hit bottom with the stage let go) it settles for good into
  // the static layout.
  useEffect(() => {
    if (infoDone) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const el = infoScrollRef.current;
      if (!el) return;
      const { top, bottom } = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const atPageEnd = window.scrollY + vh >= document.documentElement.scrollHeight - 2;
      if (bottom <= 0 || (atPageEnd && bottom <= vh)) {
        infoBottomRef.current = bottom;
        setInfoDone(true);
        return;
      }
      setInfoNearTop(top <= vh * 0.2);
      setScrollStep(top > 0 ? -1 : Math.floor(-top / stepPx));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    const onResize = () => {
      setStepPx(Math.max(200, Math.round(window.innerHeight * 0.4)));
      onScroll();
    };

    onResize();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [stepPx, infoDone]);

  // A quick flick can cross several steps in one frame, which would drop lines
  // in (or switch Biography for Work) before anyone saw them. The section walks
  // toward wherever the scroll is one step at a time instead, so every line
  // still plays in order however fast the page is scrolled.
  useEffect(() => {
    if (infoStep === scrollStep) return;
    const wait = Math.max(0, INFO_STEP_MS - (performance.now() - lastInfoMoveRef.current));
    const timer = setTimeout(() => {
      lastInfoMoveRef.current = performance.now();
      setInfoStep((step) => step + Math.sign(scrollStep - step));
    }, wait);
    return () => clearTimeout(timer);
  }, [infoStep, scrollStep]);

  // While the stage is pinned, one scroll gesture is one step. Left alone, a
  // single trackpad flick carries its momentum through several lines — often
  // the whole section — so wheel and touch are taken over here: the first
  // event of a gesture moves the page to the next step, and the rest of that
  // gesture (its momentum) is swallowed. Past the finished Work list, or above
  // the title, the page scrolls normally again.
  useEffect(() => {
    if (infoDone) return;

    const rectOf = () => infoScrollRef.current?.getBoundingClientRect();

    const goTo = (step) => {
      const rect = rectOf();
      if (!rect) return;
      const docTop = rect.top + window.scrollY;
      // Land mid-step so rounding never puts it a step either side.
      window.scrollTo({ top: docTop + step * stepPx + stepPx / 2, behavior: 'instant' });
    };

    const stepNow = () => {
      const top = rectOf()?.top;
      return top === undefined ? 0 : Math.floor(-top / stepPx);
    };

    // Only the finished biography lets go easily; the finished Work list is
    // held (see reachedEnd below).
    const leavingFinishedList = () => stepNow() === bioItems.length;

    // When the Work list finished playing, so the hold can be timed from it.
    let reachedEnd = 0;

    // The step a move of `dy` should land on, or null to let the page scroll.
    // One gesture carries to the next stop, so a push reveals a whole list.
    const targetFor = (dy) => {
      const rect = rectOf();
      if (!rect) return null;
      const { top } = rect;
      const step = Math.floor(-top / stepPx);

      if (dy > 0) {
        if (top - dy > 0) return null;          // still on its way up the screen
        if (top > 0) return STOPS[0];           // arriving: stop on the title
        // The end of Work holds the screen for a beat before it will release.
        if (step >= LAST_HELD_STEP) {
          if (!reachedEnd) reachedEnd = performance.now();
          return performance.now() - reachedEnd < RELEASE_DWELL_MS ? step : null;
        }
        // The first stop past where it is now.
        return STOPS.find((stop) => stop > step) ?? null;
      }
      reachedEnd = 0;
      if (top >= 0 || step <= 0) return null;   // at the title: let it go back up
      // Past the last stop the stage has let go and is scrolling away, so the
      // page is left alone in both directions. Catching it here used to yank it
      // back to the finished list the moment you scrolled up — smooth going
      // down, a snap coming back. Below that the stage is pinned again, where a
      // jump between stops moves nothing on screen but the lines themselves.
      if (step > LAST_HELD_STEP) return null;
      // Coming back up, the same stops in reverse.
      return [...STOPS].reverse().find((stop) => stop < step) ?? 0;
    };

    let lastEvent = 0;
    let lastStep = 0;
    let lastSize = 0;

    const onWheel = (e) => {
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      const dy = e.deltaY * unit;
      if (!dy) return;
      const target = targetFor(dy);
      if (target === null) return;

      e.preventDefault();
      const now = performance.now();
      const size = Math.abs(dy);
      const sinceStep = now - lastStep;
      const ease = leavingFinishedList() ? LAST_LINE_EASE : 1;
      const fresh =
        now - lastEvent > GESTURE_GAP_MS * ease ||
        (sinceStep > PUSH_AFTER_MS * ease && size > PUSH_SIZE * ease && size > lastSize * 1.5) ||
        // Momentum ends in a trickle of tiny equal deltas; a real wheel's are big.
        (sinceStep > GESTURE_REPEAT_MS * ease && size > 10 && size >= lastSize);
      lastEvent = now;
      lastSize = size;
      if (!fresh) return;
      lastStep = now;
      goTo(target);
    };

    // Touch: a swipe inside the section is one step, and the page is held still
    // under the finger so no fling can build up.
    let touchY = null;
    let touchStepped = false;

    const onTouchStart = (e) => {
      touchY = e.touches[0].clientY;
      touchStepped = false;
    };

    const onTouchMove = (e) => {
      if (touchY === null) return;
      const dy = touchY - e.touches[0].clientY;
      if (!dy) return;
      const target = targetFor(dy);
      if (target === null) return;
      e.preventDefault();
      const reach = leavingFinishedList() ? TOUCH_REACH * LAST_LINE_EASE : TOUCH_REACH;
      if (!touchStepped && Math.abs(dy) > reach) {
        touchStepped = true;
        goTo(target);
      }
    };

    const onTouchEnd = () => {
      touchY = null;
    };

    // Anything else that jumps from above the section to deep inside it in one
    // go (a fling that started above it, Page Down, End) is caught on the title.
    let lastTop = rectOf()?.top ?? 0;
    const onScroll = () => {
      const rect = rectOf();
      if (!rect) return;
      if (lastTop > 0 && rect.top < -stepPx && rect.bottom > 0) goTo(0);
      lastTop = rectOf()?.top ?? rect.top;
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('scroll', onScroll);
    };
    // The stops and the list lengths come from editable content now, so they
    // are dependencies rather than module constants.
  }, [stepPx, infoDone, LAST_HELD_STEP, STOPS, bioItems.length]);

  // Swapping the tall pinned section for the static one shortens the page by
  // thousands of pixels; shift the scroll by the same amount so whatever is on
  // screen (the footer) does not jump.
  useLayoutEffect(() => {
    if (!infoDone || infoBottomRef.current === null || !infoScrollRef.current) return;
    const shift = infoScrollRef.current.getBoundingClientRect().bottom - infoBottomRef.current;
    infoBottomRef.current = null;
    if (shift) window.scrollTo({ top: window.scrollY + shift, behavior: 'instant' });
  }, [infoDone]);

  // Blur reveal effect on open - line by line from top to bottom.
  //
  // Written straight onto the word spans, not through React state: a state
  // update per frame re-rendered the whole page ~60 times over the reveal.
  // The spans carry no style prop, so a re-render never undoes these writes.
  useEffect(() => {
    if (!showContent) return;

    let animationFrame = 0;

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      if (!bodyTextRef.current) return;

      const words = bodyTextRef.current.querySelectorAll('span');
      if (words.length === 0) return;

      // Get each word's vertical position relative to the container
      const containerTop = bodyTextRef.current.offsetTop;
      const wordPositions = [];
      let minTop = Infinity;
      let maxTop = 0;

      words.forEach((word) => {
        const wordTop = word.offsetTop - containerTop;
        minTop = Math.min(minTop, wordTop);
        maxTop = Math.max(maxTop, wordTop);
        wordPositions.push({
          el: word,
          top: wordTop,
          settledOpacity: word.dataset.highlight === 'true' ? '1' : '0.6',
          wrote: ''
        });
      });

      const totalHeight = maxTop - minTop || 1;
      const gradientHeight = 0.4; // 40% of text height for gradient spread
      const animationDuration = 800; // Total animation time in ms

      let startTime = null;

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        // Add extra progress to ensure all text is fully revealed at the end
        const progress = Math.min(1 + gradientHeight, elapsed / animationDuration);

        wordPositions.forEach((word) => {
          // Normalize position from 0 to 1
          const normalizedPosition = (word.top - minTop) / totalHeight;

          // Calculate distance from reveal line
          const distance = normalizedPosition - progress;

          let filter;
          let opacity;
          if (distance <= 0) {
            // Fully revealed, settled to its final opacity
            filter = 'none';
            opacity = word.settledOpacity;
          } else if (distance < gradientHeight) {
            // In gradient zone - smooth transition, full opacity while revealing
            filter = `blur(${((distance / gradientHeight) * 5).toFixed(2)}px)`;
            opacity = '1';
          } else {
            return; // Not yet revealed: still the stylesheet's hidden state
          }

          const next = `${filter}|${opacity}`;
          if (next === word.wrote) return;
          word.wrote = next;
          word.el.style.filter = filter;
          word.el.style.opacity = opacity;
        });

        if (progress < 1 + gradientHeight) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          animationFrame = 0;
        }
      };

      animationFrame = requestAnimationFrame(animate);
    }, 400); // Initial delay for content fade-in

    return () => {
      clearTimeout(timer);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [showContent]);

  const firstSentence = about?.intro ?? '';
  const restOfText = about?.body ?? '';

  // Split text into words for blur reveal. Each starts hidden (see BlurWord);
  // the effect above reveals them.
  const renderBlurText = (text, isHighlight, startIndex) =>
    text.split(' ').map((word, i) => (
      <S.BlurWord
        key={startIndex + i}
        $isHighlight={isHighlight}
        data-highlight={isHighlight}
      >
        {word}{' '}
      </S.BlurWord>
    ));

  const firstSentenceWords = firstSentence.split(' ').length;

  const onWork = infoStep >= WORK_START;
  const bioShown = onWork ? 0 : Math.max(0, infoStep);
  const workShown = onWork ? infoStep - WORK_START : 0;

  return (
    <S.Container>
      <Header />

      {/* About title at top center */}
      <S.Title $isVisible={showContent}>About</S.Title>

      {/* Main content frame */}
      <S.ContentFrame $isVisible={showContent}>
        {/* Welcome header */}
        <S.SectionHeader>
          <S.SectionHeaderText>Welcome</S.SectionHeaderText>
          <S.SectionHeaderText>S.1</S.SectionHeaderText>
        </S.SectionHeader>

        {/* Body text with blur reveal */}
        <S.BodyText ref={bodyTextRef}>
          {renderBlurText(firstSentence, true, 0)}
          {renderBlurText(restOfText, false, firstSentenceWords)}
        </S.BodyText>

        {/* Photos frame */}
        <S.PhotosFrame $isVisible={photosVisible} ref={photosRef}>
          <S.PhotoLarge data-cursor="School" data-cursor-icon="school">
            <OptimizedImage src="/photos/About/About.jpg" alt="School" maxWidth={1080} sizes="(max-width: 768px) 100vw, 35vw" />
          </S.PhotoLarge>
          <S.PhotoMedium data-cursor="Fashion" data-cursor-icon="fashion">
            <OptimizedImage src="/photos/About/About1.jpg" alt="Fashion" maxWidth={1080} sizes="(max-width: 768px) 50vw, 30vw" />
          </S.PhotoMedium>
          <S.PhotoSmall data-cursor="Me!" data-cursor-icon="me">
            <OptimizedImage src="/photos/About/AboutMe.jpg" alt="Me" maxWidth={1080} sizes="(max-width: 768px) 50vw, 25vw" />
          </S.PhotoSmall>
        </S.PhotosFrame>

      </S.ContentFrame>

      {infoDone ? (
        <>
          <S.InfoHeaderFrame>
            <S.SectionHeader>
              <S.SectionHeaderText>Information</S.SectionHeaderText>
              <S.SectionHeaderText>S.2</S.SectionHeaderText>
            </S.SectionHeader>
          </S.InfoHeaderFrame>

          {/* Info section, settled - Biography left, Work right */}
          <S.InfoSection ref={infoScrollRef}>
            <S.BioRow>
              <S.BioList>
                {bioItems.map((item) => (
                  <S.BioListItem key={item}>{item}</S.BioListItem>
                ))}
              </S.BioList>
              <S.BioTitle>Biography</S.BioTitle>
            </S.BioRow>

            <S.WorkRow>
              <S.WorkTitle>Work</S.WorkTitle>
              <S.WorkList>
                {workItems.map((item) => (
                  <S.WorkListItem key={item}>{item}</S.WorkListItem>
                ))}
              </S.WorkList>
            </S.WorkRow>
          </S.InfoSection>
        </>
      ) : (
        /* Info section - pinned while Biography, then Work, build up line by line */
        <S.InfoScroll
          ref={infoScrollRef}
          style={{ height: `calc(100vh + ${INFO_STEPS * stepPx}px)` }}
        >
          <S.InfoStage>
            <S.InfoHeaderFrame>
              <S.SectionHeader>
                <S.SectionHeaderText>Information</S.SectionHeaderText>
                <S.SectionHeaderText>S.2</S.SectionHeaderText>
              </S.SectionHeader>
            </S.InfoHeaderFrame>

            <S.InfoBody>
              <ScrambleText
                as={S.InfoTitle}
                text={onWork ? 'Work' : 'Biography'}
                visible={infoNearTop}
              />

              <S.InfoLists>
                <S.InfoList>
                  {bioItems.map((item, index) => (
                    <S.InfoLineMask key={item}>
                      <S.InfoLine
                        $isVisible={index < bioShown}
                        $delay={onWork ? (bioItems.length - 1 - index) * 40 : 0}
                      >
                        {item}
                      </S.InfoLine>
                    </S.InfoLineMask>
                  ))}
                </S.InfoList>
                <S.InfoList>
                  {workItems.map((item, index) => (
                    <S.InfoLineMask key={item}>
                      <S.InfoLine $isVisible={index < workShown}>{item}</S.InfoLine>
                    </S.InfoLineMask>
                  ))}
                </S.InfoList>
              </S.InfoLists>
            </S.InfoBody>
          </S.InfoStage>
        </S.InfoScroll>
      )}

      {/* The contact lines close the page: see ContactStage. */}
      <ContactStage />
    </S.Container>
  );
}

export default About;
