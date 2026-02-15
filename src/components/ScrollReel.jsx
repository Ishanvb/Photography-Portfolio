import { useEffect, useRef, useState, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useSelector } from 'react-redux';
import * as S from './ScrollReel.styled';

// Get responsive dimensions based on screen width
const getResponsiveDimensions = () => {
  if (typeof window === 'undefined') {
    return { containerWidth: 280, rectangleWidth: 46, lineSpacing: 20 };
  }

  const screenWidth = window.innerWidth;

  if (screenWidth <= 480) {
    return { containerWidth: 140, rectangleWidth: 22, lineSpacing: 14 };
  } else if (screenWidth <= 768) {
    return { containerWidth: 160, rectangleWidth: 26, lineSpacing: 16 };
  }

  return { containerWidth: 280, rectangleWidth: 46, lineSpacing: 20 };
};

const ScrollReel = forwardRef(function ScrollReel({ onManualScroll, isFixed = false }, ref) {
  const isManualScrolling = useSelector((state) => state.scroll.isManualScrolling);
  const containerRef = useRef(null);
  const rectangleRef = useRef(null);
  const linesContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const [dimensions, setDimensions] = useState(getResponsiveDimensions);
  const rectPositionRef = useRef(0);

  // Keep ref in sync with state for imperative access
  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

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

  // Memoized line positions (only changes on resize)
  const linePositions = useMemo(() => {
    const startX = 6;
    const endX = containerWidth;
    const positions = [];
    for (let x = startX; x <= endX; x += lineSpacing) {
      positions.push(x);
    }
    return positions;
  }, [containerWidth, lineSpacing]);

  // Imperative DOM update — bypasses React rendering entirely at 60fps
  const updateVisuals = useCallback((position) => {
    rectPositionRef.current = position;
    if (rectangleRef.current) {
      rectangleRef.current.style.left = `${position}px`;
      rectangleRef.current.style.transition = 'none';
    }
    const container = linesContainerRef.current;
    if (!container) return;
    const lines = container.children;
    const rectWidth = rectangleWidth;
    for (let i = 0; i < lines.length && i < linePositions.length; i++) {
      const lineLeft = linePositions[i];
      const isUnderRectangle = lineLeft >= position && lineLeft < position + rectWidth;
      const rectangleCenter = position + rectWidth / 2;
      const distanceFromCenter = Math.abs(lineLeft - rectangleCenter);
      const maxFadeDistance = 110;
      const minOpacity = 0.15;
      const maxOpacity = 1;
      let opacity;
      if (isUnderRectangle) {
        opacity = 0;
      } else {
        const fadeProgress = Math.min(distanceFromCenter / maxFadeDistance, 1);
        opacity = maxOpacity - (fadeProgress * (maxOpacity - minOpacity));
      }
      lines[i].style.opacity = opacity;
    }
  }, [linePositions, rectangleWidth]);

  // Expose imperative API — called at 60fps from Reel auto-scroll
  useImperativeHandle(ref, () => ({
    updateProgress(progress) {
      if (isDraggingRef.current) return;
      const position = progress * maxRectanglePosition;
      updateVisuals(position);
    }
  }), [maxRectanglePosition, updateVisuals]);

  // Set initial line opacities on mount / dimension change
  useEffect(() => {
    updateVisuals(rectPositionRef.current);
  }, [updateVisuals]);

  // Mouse drag handlers
  const handleMouseMove = useCallback((e) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const newRectX = e.clientX - containerRect.left;
    const clampedRectX = Math.max(0, Math.min(maxRectanglePosition, newRectX - rectangleWidth / 2));

    updateVisuals(clampedRectX);

    const cycleProgress = clampedRectX / maxRectanglePosition;
    onManualScroll(true, cycleProgress);
  }, [maxRectanglePosition, rectangleWidth, onManualScroll, updateVisuals]);

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

  const content = (
    <S.Container
      ref={containerRef}
      data-name="Scroll Reel"
      data-node-id="1:100"
    >
      <S.Rectangle
        ref={rectangleRef}
        onMouseDown={handleMouseDown}
        {...(isManualScrolling && { 'data-cursor': 'Resume Autoscroll' })}
      />

      <S.LinesContainer ref={linesContainerRef}>
        {linePositions.map((lineLeft, index) => (
          <S.Line
            key={`${index}-${lineLeft}`}
            style={{ left: `${lineLeft}px` }}
          />
        ))}
      </S.LinesContainer>
    </S.Container>
  );

  if (isFixed) {
    return <S.FixedWrapper>{content}</S.FixedWrapper>;
  }

  return content;
});

export default ScrollReel;
