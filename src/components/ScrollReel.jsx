import { useEffect, useRef, useState, useCallback } from 'react';
import '~/components/ScrollReel.css';

// Get responsive dimensions based on screen width
const getResponsiveDimensions = () => {
  if (typeof window === 'undefined') {
    return { containerWidth: 280, rectangleWidth: 46, lineSpacing: 20 };
  }

  const screenWidth = window.innerWidth;

  if (screenWidth <= 480) {
    // Mobile small - matches CSS @media (max-width: 480px)
    return { containerWidth: 140, rectangleWidth: 22, lineSpacing: 14 };
  } else if (screenWidth <= 768) {
    // Mobile - matches CSS @media (max-width: 768px)
    return { containerWidth: 160, rectangleWidth: 26, lineSpacing: 16 };
  }

  // Desktop
  return { containerWidth: 280, rectangleWidth: 46, lineSpacing: 20 };
};

function ScrollReel({ cycleProgress, onManualScroll, isManualScrolling, className = '' }) {
  const containerRef = useRef(null);
  const rectangleRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rectanglePosition, setRectanglePosition] = useState(0);
  const [dimensions, setDimensions] = useState(getResponsiveDimensions);

  // Update dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions(getResponsiveDimensions());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { containerWidth, rectangleWidth, lineSpacing } = dimensions;
  const maxRectanglePosition = containerWidth - rectangleWidth;

  // Update rectangle position based on cycle progress when not dragging
  useEffect(() => {
    if (!isDragging && rectangleRef.current) {
      const position = cycleProgress * maxRectanglePosition;
      setRectanglePosition(position);
      rectangleRef.current.style.left = `${position}px`;
      rectangleRef.current.style.transition = 'none';
    }
  }, [cycleProgress, maxRectanglePosition, isDragging]);

  const handleMouseMove = useCallback((e) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    // Calculate new rectangle position
    const newRectX = e.clientX - containerRect.left;
    const clampedRectX = Math.max(0, Math.min(maxRectanglePosition, newRectX - rectangleWidth / 2));
    
    setRectanglePosition(clampedRectX);
    
    if (rectangleRef.current) {
      rectangleRef.current.style.left = `${clampedRectX}px`;
    }

    // Calculate corresponding cycle progress (0 to 1)
    const cycleProgress = clampedRectX / maxRectanglePosition;
    onManualScroll(true, cycleProgress);
  }, [maxRectanglePosition, rectangleWidth, onManualScroll]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    onManualScroll(false);
  }, [onManualScroll]);

  const handleMouseDown = () => {
    setIsDragging(true);
    onManualScroll(true);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Generate vertical lines across the band the rectangle travels through (including the initial area)
  // All vertical lines have equal spacing and are rendered from left inset to the right bound.
  // They behave identically: each line hides individually when the rectangle covers it.
  // Line spacing and band - lineSpacing comes from responsive dimensions
  const startX = 6; // include the rectangle's initial area so lines beneath it reappear when it leaves
  const endX = containerWidth; // right bound of band
  const linePositions = [];
  for (let x = startX; x <= endX; x += lineSpacing) {
    linePositions.push(x);
  }

  return (
    <div 
      className={`scroll-reel-container ${className}`.trim()} 
      ref={containerRef}
      data-name="Scroll Reel" 
      data-node-id="1:100"
    >
      <div
        className="scroll-reel-rectangle"
        ref={rectangleRef}
        onMouseDown={handleMouseDown}
        {...(isManualScrolling && { 'data-cursor': 'Resume Autoscroll' })}
      />

      {/* Lines across the rectangle's band — unified set, equal spacing, gradient opacity based on distance from rectangle */}
      <div className="scroll-reel-lines">
        {linePositions.map((lineLeft, index) => {
          // Lines under the rectangle are hidden
          const isUnderRectangle = lineLeft >= rectanglePosition && lineLeft < rectanglePosition + rectangleWidth;

          // Calculate distance from rectangle center for gradient effect
          const rectangleCenter = rectanglePosition + rectangleWidth / 2;
          const distanceFromCenter = Math.abs(lineLeft - rectangleCenter);

          // Gradient: lines close to rectangle are opaque, fade as they get further
          // Max fade distance (how far until lines become minimum opacity)
          const maxFadeDistance = 110;
          const minOpacity = 0.15;
          const maxOpacity = 1;

          // Calculate opacity based on distance (closer = more opaque)
          let lineOpacity;
          if (isUnderRectangle) {
            lineOpacity = 0;
          } else {
            // Linear fade from maxOpacity at rectangle edge to minOpacity at maxFadeDistance
            const fadeProgress = Math.min(distanceFromCenter / maxFadeDistance, 1);
            lineOpacity = maxOpacity - (fadeProgress * (maxOpacity - minOpacity));
          }

          return (
            <div
              key={`${index}-${lineLeft}`}
              className="scroll-reel-line"
              style={{
                left: `${lineLeft}px`,
                opacity: lineOpacity
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ScrollReel;

