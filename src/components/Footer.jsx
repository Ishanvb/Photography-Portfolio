import { useState, useEffect, useRef } from 'react';
import '~/components/Footer.css';

function Footer() {
  const footerRef = useRef(null);
  const [visibleLines, setVisibleLines] = useState([]);

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
    <footer className="footer" ref={footerRef}>
      {/* Section header */}
      <div className={`footer-section-header ${visibleLines.length > 0 ? 'visible' : ''}`}>
        <span>Contact information</span>
        <span>F.1</span>
      </div>

      {/* Footer lines */}
      <div className="footer-lines">
        {footerLines.map((line, index) => (
        <div
          key={index}
          className={`footer-line ${line.dimmed ? 'dimmed' : ''} ${visibleLines.includes(index) ? 'visible' : ''}`}
        >
          <span className="footer-line-left">{line.left}</span>
          {line.href ? (
            <a
              href={line.href}
              className="footer-line-right footer-link"
              target={line.external ? '_blank' : undefined}
              rel={line.external ? 'noopener noreferrer' : undefined}
              data-cursor={line.cursorLabel}
            >
              {line.right}
            </a>
          ) : (
            <span className="footer-line-right">{line.right}</span>
          )}
        </div>
        ))}
      </div>
    </footer>
  );
}

export default Footer;
