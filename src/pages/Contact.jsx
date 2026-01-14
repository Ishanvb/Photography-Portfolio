import Header from '../components/Header';
import './Contact.css';

function Contact() {
  return (
    <div className="contact">
      <Header />
      <div className="contact-container">
        <div className="heading-with-lines">
          <span className="guide-line guide-line-left"></span>
          <span className="guide-line guide-line-right"></span>
          <span className="guide-line guide-line-bottom"></span>
          <h1 className="contact-heading">
            <span className="semibold">Lets</span> <span className="work-script">work</span> <span className="semibold">together</span>
          </h1>
        </div>
        <div className="contact-box">
          <span className="corner corner-tl"></span>
          <span className="corner corner-tr"></span>
          <span className="corner corner-bl"></span>
          <span className="corner corner-br"></span>

          <h2 className="contact-title">Contact:</h2>

          <div className="contact-item">
            <span className="contact-label">Mobile: </span>
            <a href="tel:+15127756749" className="contact-link">+1 512.775.6749</a>
          </div>

          <div className="contact-item">
            <a href="mailto:mariannaparzick@gmail.com" className="contact-link email">
              mariannaparzick@gmail.com
            </a>
          </div>

          <div className="contact-item">
            <span className="contact-label">LinkedIn: </span>
            <a href="https://linkedin.com/in/marianna-parzick" target="_blank" rel="noopener noreferrer" className="contact-link contact-link-underline">
              marianna-parzick
            </a>
          </div>

          <div className="contact-item">
            <span className="contact-label">Instagram: </span>
            <a href="https://instagram.com/fla5hedbymari" target="_blank" rel="noopener noreferrer" className="contact-link">
              @fla5hedbymari
            </a>
          </div>

          <div className="reach-out">Reach Out!</div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
