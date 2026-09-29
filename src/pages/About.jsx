import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import OptimizedImage from '~/components/OptimizedImage';
import ScrambleText from '~/components/ScrambleText';
import * as S from './About.styled';

const BIO_ITEMS = [
  'Hometown : Austin, TX',
  'School : Cal Poly San Luis Obispo',
  'Year : 3rd',
  'Major : Business',
  'Minor : Photography and Videography',
  'Favorite Camera : Nikon D3500',
];

const WORK_ITEMS = ['Cal Poly FITS', 'MeerMutter Label', 'ART 122'];

// Step 0 is the title alone; each step after that adds a line. Once the
// biography is complete it holds for a step, then rolls into "Work"; the work
// lines follow and hold likewise, with a last step before the stage lets go.
const WORK_START = BIO_ITEMS.length + 2;
const INFO_STEPS = WORK_START + WORK_ITEMS.length + 2;
// The last step scrolling stops on: the finished Work list.
const LAST_HELD_STEP = INFO_STEPS - 2;

// The fastest the Information section will move on by one line.
const INFO_STEP_MS = 220;
// A scroll gesture counts as new once the wheel has been quiet this long, or
// when it pushes harder mid-momentum; a wheel spun without let-up moves on
// again every GESTURE_REPEAT_MS (momentum only ever fades, so it never does).
const GESTURE_GAP_MS = 160;
const GESTURE_REPEAT_MS = 900;

function About() {
  const [showContent, setShowContent] = useState(false);
  const [wordStyles, setWordStyles] = useState({});
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

    // The step a move of `dy` should land on, or null to let the page scroll.
    const targetFor = (dy) => {
      const rect = rectOf();
      if (!rect) return null;
      const { top, bottom } = rect;
      const step = Math.floor(-top / stepPx);

      if (dy > 0) {
        if (top - dy > 0) return null;          // still on its way up the screen
        if (top > 0) return 0;                  // arriving: stop on the title
        return step < LAST_HELD_STEP ? step + 1 : null;
      }
      if (top >= 0 || step <= 0) return null;   // at the title: let it go back up
      if (step > LAST_HELD_STEP) return bottom > 0 ? LAST_HELD_STEP : null;
      return step - 1;
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
      const fresh =
        now - lastEvent > GESTURE_GAP_MS ||
        (sinceStep > 250 && size > 20 && size > lastSize * 1.5) ||
        // Momentum ends in a trickle of tiny equal deltas; a real wheel's are big.
        (sinceStep > GESTURE_REPEAT_MS && size > 10 && size >= lastSize);
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
      if (!touchStepped && Math.abs(dy) > 30) {
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
  }, [stepPx, infoDone]);

  // Swapping the tall pinned section for the static one shortens the page by
  // thousands of pixels; shift the scroll by the same amount so whatever is on
  // screen (the footer) does not jump.
  useLayoutEffect(() => {
    if (!infoDone || infoBottomRef.current === null || !infoScrollRef.current) return;
    const shift = infoScrollRef.current.getBoundingClientRect().bottom - infoBottomRef.current;
    infoBottomRef.current = null;
    if (shift) window.scrollTo({ top: window.scrollY + shift, behavior: 'instant' });
  }, [infoDone]);

  // Blur reveal effect on open - line by line from top to bottom
  useEffect(() => {
    if (!showContent) return;

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

      words.forEach((word, index) => {
        const wordTop = word.offsetTop - containerTop;
        minTop = Math.min(minTop, wordTop);
        maxTop = Math.max(maxTop, wordTop);
        wordPositions.push({ index, top: wordTop });
      });

      const totalHeight = maxTop - minTop || 1;
      const gradientHeight = 0.4; // 40% of text height for gradient spread
      const animationDuration = 800; // Total animation time in ms

      let startTime = null;
      let animationFrame;

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        // Add extra progress to ensure all text is fully revealed at the end
        const progress = Math.min(1 + gradientHeight, elapsed / animationDuration);

        const newWordStyles = {};

        wordPositions.forEach(({ index, top }) => {
          // Normalize position from 0 to 1
          const normalizedPosition = (top - minTop) / totalHeight;

          // Calculate distance from reveal line
          const distance = normalizedPosition - progress;

          let blurAmount;
          let state;

          if (distance <= 0) {
            // Fully revealed
            blurAmount = 0;
            state = 'revealed';
          } else if (distance < gradientHeight) {
            // In gradient zone - smooth transition
            const gradientProgress = distance / gradientHeight;
            blurAmount = gradientProgress * 5;
            state = 'revealing';
          } else {
            // Not yet revealed
            blurAmount = 5;
            state = 'hidden';
          }

          newWordStyles[index] = { blur: blurAmount, state };
        });

        setWordStyles(newWordStyles);

        if (progress < 1 + gradientHeight) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => {
        if (animationFrame) cancelAnimationFrame(animationFrame);
      };
    }, 400); // Initial delay for content fade-in

    return () => clearTimeout(timer);
  }, [showContent]);

  const firstSentence = "I'm a third-year Business Administration student concentrating in Marketing with a minor in Photography and Videography at Cal Poly San Luis Obispo.";
  const restOfText = " During my time at school, I've been working as a videographer for Cal Poly Athletics, filming coverage for all Division I ESPN livestreams as well as getting footage for social media and pregame edits. Through courses for my minor, my association in my school's fashion club, and personal interest, I have worked with and photographed many different subjects and activities, using a variety of skills and techniques.";

  // Split text into words for blur reveal
  const renderBlurText = (text, isHighlight, startIndex) => {
    const words = text.split(' ');
    return words.map((word, i) => {
      const globalIndex = startIndex + i;
      const style = wordStyles[globalIndex] ?? { blur: 5, state: 'hidden' };

      // Determine opacity based on state
      const originalOpacity = isHighlight ? 1 : 0.6;
      let opacity;
      if (style.state === 'hidden') {
        opacity = 0; // Not visible yet
      } else if (style.state === 'revealing') {
        opacity = 1; // Full opacity while revealing
      } else {
        opacity = originalOpacity; // Settled to final opacity
      }

      return (
        <S.BlurWord
          key={globalIndex}
          $isHighlight={isHighlight}
          style={{
            filter: `blur(${style.blur}px)`,
            opacity: opacity
          }}
        >
          {word}{' '}
        </S.BlurWord>
      );
    });
  };

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
            <OptimizedImage src="/photos/About/About.jpg" alt="School" />
          </S.PhotoLarge>
          <S.PhotoMedium data-cursor="Fashion" data-cursor-icon="fashion">
            <OptimizedImage src="/photos/About/About1.jpg" alt="Fashion" />
          </S.PhotoMedium>
          <S.PhotoSmall data-cursor="Me!" data-cursor-icon="me">
            <img src="/photos/About/AboutMe.jpg" alt="Me" />
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
                {BIO_ITEMS.map((item) => (
                  <S.BioListItem key={item}>{item}</S.BioListItem>
                ))}
              </S.BioList>
              <S.BioTitle>Biography</S.BioTitle>
            </S.BioRow>

            <S.WorkRow>
              <S.WorkTitle>Work</S.WorkTitle>
              <S.WorkList>
                {WORK_ITEMS.map((item) => (
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
                  {BIO_ITEMS.map((item, index) => (
                    <S.InfoLineMask key={item}>
                      <S.InfoLine
                        $isVisible={index < bioShown}
                        $delay={onWork ? (BIO_ITEMS.length - 1 - index) * 40 : 0}
                      >
                        {item}
                      </S.InfoLine>
                    </S.InfoLineMask>
                  ))}
                </S.InfoList>
                <S.InfoList>
                  {WORK_ITEMS.map((item, index) => (
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

      <Footer scrollReveal />
    </S.Container>
  );
}

export default About;
