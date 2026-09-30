import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import * as S from './Footer.styled';

const footerLines = [
  { left: 'Marianna', right: 'Parzick', dimmed: true },
  { left: 'Marketing', right: 'Photography', dimmed: true },
  { left: '', right: 'Videography', dimmed: true },
  { left: 'Contact', right: 'Me', dimmed: true },
  { left: 'Tel.', right: '512.775.6749', dimmed: false, href: 'tel:+15127756749', cursorLabel: 'Call Me' },
  { left: 'Mail', right: 'mparzick@calpoly.edu', dimmed: false, href: 'mailto:mariannaparzick@gmail.com', cursorLabel: 'Mail Me' },
  { left: 'LinkedIn', right: 'marianna-parzick', dimmed: false, href: 'https://www.linkedin.com/in/marianna-parzick/', external: true, cursorLabel: 'Connect With Me' },
  { left: 'Instagram', right: '@fla5hedbymari', dimmed: false, href: 'https://www.instagram.com/fla5hedbymari', external: true, cursorLabel: 'Add Me' },
  { left: 'Reach', right: 'Out!', dimmed: false },
];

/**
 * The contact lines, holding the middle of the screen. The stage around them
 * decides how many are down: `shown` is a count, and they drop in from above
 * one at a time as it rises, and pull back up as it falls.
 */
function ContactLines({ shown = 0 }) {
  const footerRef = useRef(null);
  const lineRefs = useRef([]);
  const linesRef = useRef(null);


  /**
   * Pinned, the block has to sit so the top of the first letter is as far from
   * the top of the screen as the bottom of the last letter is from the bottom.
   * Centring the box does not do that: a line box is not its letters — there is
   * leading above the cap and a descender's worth of room below the baseline,
   * and the masks carry padding besides. So the real glyph edges are measured
   * from the font itself and the block is nudged by half the difference.
   */
  useLayoutEffect(() => {
    const wrap = footerRef.current;
    const lines = linesRef.current;
    if (!wrap || !lines) return;

    let ctx;
    const balance = () => {
      const first = lines.firstElementChild?.firstElementChild;
      const last = lines.lastElementChild?.firstElementChild;
      if (!first || !last) return;

      const cs = getComputedStyle(first);
      const size = parseFloat(cs.fontSize);
      if (!size) return;
      ctx = ctx ?? document.createElement('canvas').getContext('2d');
      ctx.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;

      const top = ctx.measureText('M');
      const bottom = ctx.measureText('R');
      // line-height is 1, so the line box is exactly the font size.
      const leading = (size - (top.fontBoundingBoxAscent + top.fontBoundingBoxDescent)) / 2;
      const baselineInBox = leading + top.fontBoundingBoxAscent;

      lines.style.transform = '';
      const stage = wrap.getBoundingClientRect();
      const firstBox = lines.firstElementChild.getBoundingClientRect();
      const lastBox = lines.lastElementChild.getBoundingClientRect();

      const capTop = firstBox.top + baselineInBox - top.actualBoundingBoxAscent;
      const glyphBottom = lastBox.top + baselineInBox + bottom.actualBoundingBoxDescent;

      const nudge = ((stage.bottom - glyphBottom) - (capTop - stage.top)) / 2;
      lines.style.transform = `translateY(${nudge.toFixed(2)}px)`;
    };

    balance();
    // Fonts land after first paint, and the sizes are breakpointed.
    document.fonts?.ready.then(balance).catch(() => {});
    window.addEventListener('resize', balance);
    return () => window.removeEventListener('resize', balance);
  }, []);

  return (
    <S.FooterWrapper ref={footerRef} $pinned>
      {/* Section header */}

      {/* Footer lines */}
      <S.Lines ref={linesRef}>
        {footerLines.map((line, index) => {
          const content = (
            <S.Line
              key={index}
              $isDimmed={line.dimmed}
              $isVisible={index < shown}
              $dropIn
            >
              <S.LineLeft>{line.left}</S.LineLeft>
              {line.href ? (
                <S.LineLink
                  href={line.href}
                  target={line.external ? '_blank' : undefined}
                  rel={line.external ? 'noopener noreferrer' : undefined}
                  data-cursor={line.cursorLabel}
                >
                  {line.right}
                </S.LineLink>
              ) : (
                <S.LineRight>{line.right}</S.LineRight>
              )}
            </S.Line>
          );
          return (
            <S.LineMask key={index} ref={(el) => { lineRefs.current[index] = el; }}>
              {content}
            </S.LineMask>
          );
        })}
      </S.Lines>
    </S.FooterWrapper>
  );
}

/**
 * The "Contact information" rule on its own, for pages where the contact lines
 * have moved to a stage of their own: it stays where it always was, the same
 * distance below whatever came before it.
 */
export function ContactHeader() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <S.FooterWrapper as="div" ref={ref} $headerOnly>
      <S.SectionHeader $isVisible={visible}>
        <S.SectionHeaderText>Contact information</S.SectionHeaderText>
        <S.SectionHeaderText>F.1</S.SectionHeaderText>
      </S.SectionHeader>
    </S.FooterWrapper>
  );
}

export const CONTACT_LINE_COUNT = footerLines.length;

// The stage's own height decides how much scroll brings the next line down, so
// there is one source of truth: --contact-step in the stylesheet. Recomputing it
// here instead would drift — CSS resolves 22vh unrounded and a rounded copy left
// the runway a few pixels short of the last line.
// However fast the page is scrolled, the lines still arrive in order.
const LINE_MS = 150;

/**
 * The contact lines as the last stage of a page.
 *
 * The header keeps the place it has always had, above. Below it the lines take
 * a screen of their own: the stage pins, and every step of scroll past that
 * point brings one more line down — and takes it back up again on the way back.
 * A flick cannot skip any: the count walks toward whatever the scroll asked for
 * one line at a time.
 */
export function ContactStage() {
  const stageRef = useRef(null);
  const [target, setTarget] = useState(0);
  const [shown, setShown] = useState(0);
  const lastMove = useRef(0);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const { top, height } = el.getBoundingClientRect();
      // Everything past the pinned screen is the runway, shared out between the
      // lines that have to arrive after the first.
      const runway = height - window.innerHeight;
      const step = runway / Math.max(1, CONTACT_LINE_COUNT - 1);
      if (step <= 0) return;
      // A pixel of tolerance: the document height rounds to whole pixels, so the
      // real bottom of the page can sit a fraction short of the full runway and
      // the last line would never come down.
      const reached = top > 0 ? 0 : Math.floor((-top + 1) / step) + 1;
      setTarget(Math.max(0, Math.min(CONTACT_LINE_COUNT, reached)));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (shown === target) return;
    const wait = Math.max(0, LINE_MS - (performance.now() - lastMove.current));
    const timer = setTimeout(() => {
      lastMove.current = performance.now();
      setShown((n) => n + Math.sign(target - n));
    }, wait);
    return () => clearTimeout(timer);
  }, [shown, target]);

  return (
    <>
      <ContactHeader />
      <S.Stage ref={stageRef} $lines={CONTACT_LINE_COUNT}>
        <S.StagePin>
          <ContactLines shown={shown} />
        </S.StagePin>
      </S.Stage>
    </>
  );
}

