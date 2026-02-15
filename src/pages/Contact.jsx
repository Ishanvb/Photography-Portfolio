import { useState, useEffect } from 'react';
import Header from '~/components/Header';
import * as S from './Contact.styled';

function Contact() {
  const [visible, setVisible] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const contactLines = [
    { left: 'Marianna', right: 'Parzick', dimmed: true },
    { left: 'Marketing', right: 'Photography', dimmed: true },
    { left: '', right: 'Videography', dimmed: true },
    { left: 'Contact', right: 'Me', dimmed: true },
    { left: 'Tel.', right: '512.775.6749', dimmed: false, href: 'tel:+15127756749' },
    { left: 'Mail', right: 'mparzick@calpoly.edu', dimmed: false, href: 'mailto:mariannaparzick@gmail.com' },
    { left: 'LinkedIn', right: 'marianna-parzick', dimmed: false, href: 'https://www.linkedin.com/in/marianna-parzick/', external: true },
    { left: 'Instagram', right: '@fla5hedbymari', dimmed: false, href: 'https://www.instagram.com/fla5hedbymari', external: true },
    { left: 'Reach', right: 'Out!', dimmed: false },
  ];

  // Trigger fade-in and highlight reveal on page load
  useEffect(() => {
    const visibleTimer = setTimeout(() => {
      setVisible(true);
    }, 100);
    const revealTimer = setTimeout(() => {
      setRevealed(true);
    }, 150);
    return () => {
      clearTimeout(visibleTimer);
      clearTimeout(revealTimer);
    };
  }, []);

  return (
    <S.Container>
      <Header />

      {/* Contact lines container */}
      <S.LinesContainer>
        {contactLines.map((line, index) => (
          <S.ContactLine
            key={index}
            $isDimmed={line.dimmed}
            $isVisible={visible}
            $isRevealed={revealed}
            $index={index}
          >
            <S.LineLeft>{line.left}</S.LineLeft>
            {line.href ? (
              <S.ContactLink
                href={line.href}
                $isVisible={visible}
                target={line.external ? '_blank' : undefined}
                rel={line.external ? 'noopener noreferrer' : undefined}
              >
                {line.right}
              </S.ContactLink>
            ) : (
              <S.LineRight>{line.right}</S.LineRight>
            )}
          </S.ContactLine>
        ))}
      </S.LinesContainer>
    </S.Container>
  );
}

export default Contact;
