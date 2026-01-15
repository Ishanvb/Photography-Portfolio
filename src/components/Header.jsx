import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const AnimatedLabel = ({ text }) => {
  return (
    <span className="animated-word">
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="letter"
          style={{ transitionDelay: `${i * 35}ms` }}
        >
          <span className="letter-stack">
            <span>{char === " " ? "\u00A0" : char}</span>
            <span>{char === " " ? "\u00A0" : char}</span>
          </span>
        </span>
      ))}
    </span>
  );
};


function Header() {
  const [hoveredButton, setHoveredButton] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const buttons = [
    { id: 'home', label: '01 home', path: '/' },
    { id: 'work', label: '02 work', path: '/work' },
    { id: 'about', label: '03 about', path: '/about' },
    { id: 'contact', label: '04 Contact', path: '/contact' }
  ];

  const handleButtonClick = (path) => {
    if (location.pathname === path) {
      window.location.reload();
    } else {
      navigate(path);
    }
  };

  const isActive = (path) => {
    // For work button, check if current path starts with /work
    if (path === '/work') {
      return location.pathname.startsWith('/work');
    }
    return location.pathname === path;
  };

  return (
    <header className="header" data-name="Header" data-node-id="1:18">
      {buttons.map((button) => (
        <button
          key={button.id}
          className={`header-button ${hoveredButton === button.id ? 'hovered' : ''} ${isActive(button.path) ? 'active' : ''}`}
          onMouseEnter={() => setHoveredButton(button.id)}
          onMouseLeave={() => setHoveredButton(null)}
          onClick={() => handleButtonClick(button.path)}
          data-name="Button"
        >
          <p>
            <AnimatedLabel text={button.label} />
          </p>
        </button>
      ))}
    </header>
  );
}

export default Header;

