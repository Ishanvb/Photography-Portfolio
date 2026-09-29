import { useState, useEffect } from 'react';
import * as S from '~/components/LoadingScreen.styled';

function LoadingScreen({ isLoading, onFadeComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  // The screen is fading exactly when there is nothing left to load.
  const isFading = !isLoading;

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      setIsVisible(false);
      onFadeComplete?.();
    }, 500);
    return () => clearTimeout(timer);
  }, [isLoading, onFadeComplete]);

  if (!isVisible) return null;

  return (
    <S.Screen $isFading={isFading}>
      <S.Logo>
        <S.FlowerSpinner
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="currentColor">
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <ellipse
                key={i}
                cx="50"
                cy="25"
                rx="12"
                ry="22"
                transform={`rotate(${angle} 50 50)`}
              />
            ))}
            <circle cx="50" cy="50" r="10" />
          </g>
        </S.FlowerSpinner>
      </S.Logo>
    </S.Screen>
  );
}

export default LoadingScreen;
