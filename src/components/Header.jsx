import { useState, useEffect, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as S from './Header.styled';

const AnimatedLabel = memo(({ text, isClicking, isEnterReady, isEntering }) => {
  return (
    <S.AnimatedWord>
      {text.split("").map((char, i) => (
        <S.Letter
          key={i}
          style={{ transitionDelay: `${i * 35}ms` }}
        >
          <S.LetterStack
            $isClicking={isClicking}
            $isEnterReady={isEnterReady}
            $isEntering={isEntering}
          >
            <span>{char === " " ? "\u00A0" : char}</span>
            <span>{char === " " ? "\u00A0" : char}</span>
          </S.LetterStack>
        </S.Letter>
      ))}
    </S.AnimatedWord>
  );
});

AnimatedLabel.displayName = 'AnimatedLabel';

const buttons = [
  { id: 'home', label: '01 home', path: '/' },
  { id: 'work', label: '02 work', path: '/work' },
  { id: 'about', label: '03 about', path: '/about' },
  { id: 'contact', label: '04 Contact', path: '/contact' }
];

function Header() {
  const [hoveredButton, setHoveredButton] = useState(null);
  const [clickingButton, setClickingButton] = useState(null);
  const [enterReady, setEnterReady] = useState(null);
  const [entering, setEntering] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

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
    <S.HeaderContainer data-name="Header" data-node-id="1:18">
      {buttons.map((button) => (
        <S.HeaderButton
          key={button.id}
          $isActive={isActive(button.path)}
          $isHovered={hoveredButton === button.id}
          onMouseEnter={() => setHoveredButton(button.id)}
          onMouseLeave={() => setHoveredButton(null)}
          onClick={() => handleButtonClick(button.id, button.path)}
          data-name="Button"
          data-cursor-header
        >
          <p>
            <AnimatedLabel
              text={button.label}
              isClicking={clickingButton === button.id}
              isEnterReady={enterReady === button.id}
              isEntering={entering === button.id}
            />
          </p>
        </S.HeaderButton>
      ))}
    </S.HeaderContainer>
  );
}

export default Header;
