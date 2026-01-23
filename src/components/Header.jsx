import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '~/components/Header.css';

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
  const [clickingButton, setClickingButton] = useState(null);
  const [enterReady, setEnterReady] = useState(null);
  const [entering, setEntering] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const buttons = [
    { id: 'home', label: '01 home', path: '/' },
    { id: 'work', label: '02 work', path: '/work' },
    { id: 'about', label: '03 about', path: '/about' },
    { id: 'contact', label: '04 Contact', path: '/contact' }
  ];

  const handleButtonClick = (buttonId, path) => {
    // Trigger the exit animation (letters scroll up)
    setClickingButton(buttonId);

    // Wait for exit animation to complete, then navigate
    setTimeout(() => {
      setClickingButton(null);
      if (location.pathname === path) {
        window.location.reload();
      } else {
        navigate(path);
      }
    }, 450);
  };

  const isActive = (path) => {
    // For work button, check if current path starts with /work
    if (path === '/work') {
      return location.pathname.startsWith('/work');
    }
    return location.pathname === path;
  };

  // Trigger enter animation (letters scroll down) on the active button when page loads
  useEffect(() => {
    const activeButton = buttons.find(button => isActive(button.path));
    if (activeButton) {
      // Step 1: Position letters above (no transition) - they start hidden
      setEnterReady(activeButton.id);

      // Step 2: After a frame, trigger enter animation (letters scroll down)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEnterReady(null);
          setEntering(activeButton.id);

          // Clean up after animation completes
          setTimeout(() => {
            setEntering(null);
          }, 450);
        });
      });
    }
  }, [location.pathname]);

  return (
    <header className="header" data-name="Header" data-node-id="1:18">
      {buttons.map((button) => (
        <button
          key={button.id}
          className={`header-button ${hoveredButton === button.id ? 'hovered' : ''} ${isActive(button.path) ? 'active' : ''} ${clickingButton === button.id ? 'clicking' : ''} ${enterReady === button.id ? 'enter-ready' : ''} ${entering === button.id ? 'entering' : ''}`}
          onMouseEnter={() => setHoveredButton(button.id)}
          onMouseLeave={() => setHoveredButton(null)}
          onClick={() => handleButtonClick(button.id, button.path)}
          data-name="Button"
          data-cursor-header
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

