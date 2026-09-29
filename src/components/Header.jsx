import { useState, useEffect, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from '~/components/ThemeToggle';
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

function Header({ onHomeClick }) {
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
      // Home has somewhere to go back to of its own — the gallery closing — so
      // it says so rather than being reloaded on the spot.
      if (buttonId === 'home' && onHomeClick) {
        onHomeClick();
      } else if (location.pathname === path) {
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

  // Trigger enter animation (letters scroll down) on the active button when page
  // loads. The match is inlined rather than reusing isActive() so the effect
  // depends only on the path, and every frame and timer it starts is cancelled
  // on the way out — navigating quickly used to let the old route's timeout cut
  // the new page's animation short.
  useEffect(() => {
    const active = buttons.find(({ path }) =>
      path === '/work' ? location.pathname.startsWith('/work') : location.pathname === path
    );
    if (!active) return;

    // Step 1: position letters above (no transition) — they start hidden.
    setEnterReady(active.id);

    let secondFrame = 0;
    let settle = 0;
    // Step 2: after a frame, let them scroll down into place.
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        setEnterReady(null);
        setEntering(active.id);
        settle = setTimeout(() => setEntering(null), 450);
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      clearTimeout(settle);
    };
  }, [location.pathname]);

  return (
    <S.HeaderContainer data-name="Header" data-node-id="1:18">
      {buttons.map(({ id, label, path }, index) => [
        // The day/night switch sits in the middle of the row.
        index === 2 && <ThemeToggle key="theme-toggle" />,
        <S.HeaderButton
          key={id}
          $isActive={isActive(path)}
          $isHovered={hoveredButton === id}
          onMouseEnter={() => setHoveredButton(id)}
          onMouseLeave={() => setHoveredButton(null)}
          onClick={() => handleButtonClick(id, path)}
          data-name="Button"
          data-cursor-header
        >
          <p>
            <AnimatedLabel
              text={label}
              isClicking={clickingButton === id}
              isEnterReady={enterReady === id}
              isEntering={entering === id}
            />
          </p>
        </S.HeaderButton>,
      ])}
    </S.HeaderContainer>
  );
}

export default Header;
