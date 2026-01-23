import { useState, useEffect } from 'react';
import '~/components/LoadingScreen.css';

function LoadingScreen({ isLoading, onFadeComplete }) {
  const [isFading, setIsFading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // When isLoading becomes false, start fade out
    if (!isLoading && !isFading) {
      setIsFading(true);
      // After fade animation completes, hide and notify parent
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
    <div className={`loading-screen ${isFading ? 'fade-out' : ''}`}>
      <div className="loading-logo">
        {/* Flower logo SVG */}
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          className="flower-spinner"
        >
          {/* 6-petal flower design */}
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
            {/* Center circle */}
            <circle cx="50" cy="50" r="10" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default LoadingScreen;
