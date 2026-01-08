import { useEffect, useRef, useState, useCallback } from 'react';
import './ScrollReel.css';

function ScrollReel({ cycleProgress, onManualScroll, isManualScrolling, className = '' }) {
  const containerRef = useRef(null);
  const rectangleRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rectanglePosition, setRectanglePosition] = useState(0);

  // Scroll size constants (change here to alter JS-driven behavior)
  // To tweak visual sizes, prefer editing CSS variables in `ScrollReel.css`
  const containerWidth = 280; // reduced from 316 to make the control a bit smaller
  const rectangleWidth = 46; // reduced from 56 to make the thumb smaller
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

  const handleMouseDown = (e) => {
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
  // Line spacing and band (change spacing here if needed)
  const lineSpacing = 20; // equal spacing across the band (20px per design)
  const startX = 8; // include the rectangle's initial area so lines beneath it reappear when it leaves
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
      />

      {/* Lines across the rectangle's band — unified set, equal spacing, hide as covered */}
      <div className="scroll-reel-lines">
        {linePositions.map((lineLeft, index) => {
          // Lines are placed statically, but we hide any line currently covered by the rectangle
          const isUnderRectangle = lineLeft >= rectanglePosition && lineLeft < rectanglePosition + rectangleWidth;
          return (
            <div
              key={`${index}-${lineLeft}`}
              className="scroll-reel-line"
              style={{
                left: `${lineLeft}px`,
                opacity: isUnderRectangle ? 0 : 1
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ScrollReel;

