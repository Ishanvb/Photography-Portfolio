import { useState, useEffect, useRef } from 'react';
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
 * With `scrollReveal`, each line is tied to the scroll instead of a timer: it
 * drops in from under the line above as it comes fully into view, and pulls
 * back up if the page is scrolled back past it.
 */
function Footer({ scrollReveal = false }) {
  const footerRef = useRef(null);
  const lineRefs = useRef([]);
  const [visibleLines, setVisibleLines] = useState([]);
  const [headerInView, setHeaderInView] = useState(false);

  useEffect(() => {
    if (!scrollReveal) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const vh = window.innerHeight;
      const top = footerRef.current?.getBoundingClientRect().top ?? Infinity;
      setHeaderInView(top <= vh * 0.9);
      const shown = [];
      lineRefs.current.forEach((el, index) => {
        if (el && el.getBoundingClientRect().bottom <= vh - 16) shown.push(index);
      });
      setVisibleLines((prev) =>
        prev.length === shown.length && prev.every((v, i) => v === shown[i]) ? prev : shown
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [scrollReveal]);

  useEffect(() => {
    if (scrollReveal) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger the line reveals
            footerLines.forEach((_, index) => {
              setTimeout(() => {
                setVisibleLines((prev) => [...prev, index]);
              }, index * 100);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, [scrollReveal]);

  return (
    <S.FooterWrapper ref={footerRef}>
      {/* Section header */}
      <S.SectionHeader $isVisible={scrollReveal ? headerInView : visibleLines.length > 0}>
        <S.SectionHeaderText>Contact information</S.SectionHeaderText>
        <S.SectionHeaderText>F.1</S.SectionHeaderText>
      </S.SectionHeader>

      {/* Footer lines */}
      <S.Lines>
        {footerLines.map((line, index) => {
          const content = (
            <S.Line
              key={index}
              $isDimmed={line.dimmed}
              $isVisible={visibleLines.includes(index)}
              $dropIn={scrollReveal}
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
          return scrollReveal ? (
            <S.LineMask key={index} ref={(el) => { lineRefs.current[index] = el; }}>
              {content}
            </S.LineMask>
          ) : content;
        })}
      </S.Lines>
    </S.FooterWrapper>
  );
}

export default Footer;
