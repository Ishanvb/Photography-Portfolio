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

// How far the stage has to have risen before the lines drop — a fraction of the
// screen, so they are down well before the page runs out of scroll.
const REVEAL_AT = 0.55;

export function ContactStage() {
  const stageRef = useRef(null);
  const [revealed, setRevealed] = useState(false);

  // The whole set comes down as one, the moment the stage has risen far enough
  // into the screen — there is no line-by-line walk any more.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const { top } = el.getBoundingClientRect();
      setRevealed(top <= window.innerHeight * REVEAL_AT);
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

  return (
    <>
      <ContactHeader />
      <S.Stage ref={stageRef}>
        <S.StagePin>
          <ContactLines shown={revealed ? CONTACT_LINE_COUNT : 0} />
        </S.StagePin>
      </S.Stage>
    </>
  );
}

