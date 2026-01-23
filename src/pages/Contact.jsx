import { useState, useEffect } from 'react';
import Header from '~/components/Header';
import '~/pages/Contact.css';

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
    <div className="contact">
      <Header />

      {/* Contact lines container */}
      <div className="contact-lines-container">
        {contactLines.map((line, index) => (
          <div
            key={index}
            className={`contact-line ${line.dimmed ? 'dimmed' : ''} ${visible ? 'visible' : ''} ${revealed ? 'revealed' : ''}`}
          >
            <span className="contact-line-left">{line.left}</span>
            {line.href ? (
              <a
                href={line.href}
                className="contact-line-right contact-link"
                target={line.external ? '_blank' : undefined}
                rel={line.external ? 'noopener noreferrer' : undefined}
              >
                {line.right}
              </a>
            ) : (
              <span className="contact-line-right">{line.right}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Contact;
