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

function Footer() {
  const footerRef = useRef(null);
  const [visibleLines, setVisibleLines] = useState([]);

  useEffect(() => {
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
  }, []);

  return (
    <S.FooterWrapper ref={footerRef}>
      {/* Section header */}
      <S.SectionHeader $isVisible={visibleLines.length > 0}>
        <S.SectionHeaderText>Contact information</S.SectionHeaderText>
        <S.SectionHeaderText>F.1</S.SectionHeaderText>
      </S.SectionHeader>

      {/* Footer lines */}
      <S.Lines>
        {footerLines.map((line, index) => (
        <S.Line
          key={index}
          $isDimmed={line.dimmed}
          $isVisible={visibleLines.includes(index)}
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
        ))}
      </S.Lines>
    </S.FooterWrapper>
  );
}

export default Footer;
