import { useState, useEffect } from 'react';
import * as S from '~/components/LoadingScreen.styled';

function LoadingScreen({ isLoading, onFadeComplete }) {
  const [isFading, setIsFading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isLoading && !isFading) {
      setIsFading(true);
      setTimeout(() => {
        setIsVisible(false);
        if (onFadeComplete) {
          onFadeComplete();
        }
      }, 500);
    }
  }, [isLoading, isFading, onFadeComplete]);

  if (!isVisible) return null;

  return (
    <S.Screen $isFading={isFading}>
      <S.Logo>
        <S.FlowerSpinner
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="#ffffe1">
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
