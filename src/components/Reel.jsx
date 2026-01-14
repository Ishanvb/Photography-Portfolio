import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reel.css';

// Asset hashes from Figma MCP (ordered 1-8)
const assetHashes = [
  '92a9b6d93d1fa93805444e74c5ce731435fbd3a2',
  'b4e734d60936cfe7a003db912c1d9a3a9dff5f6f',
  'a1d83a36df929dee913a36adb440d3cee7ee4fce',
  '2b82f9c749a60173f5347f19f52e7da344385dbe',
  '36791b84b72621de39fd424b554fd012b10b982e',
  'eae66c416d784703bed49ad863cda27ff9e653d7',
  'f1e2d3c4b5a6978877665544332211aabbccdde0',
  '3993b4721a398a862e96f84f39413d47f599bde1'
];

const getAssetBase = (hash) => {
  // Return base path (no extension). In dev this maps to `/mcp-assets/<hash>`.
  if (import.meta.env.DEV) {
    return `/mcp-assets/${hash}`;
  }
  // Production MCP uses `.png` by default, but leave base for fallback attempts
  return `http://localhost:3845/assets/${hash}`;
};

// Supported fallback extensions tried in order when an asset fails to load
// Prefer common raster formats first so uploaded JPG/PNG are used before SVG placeholders
const fallbackExts = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];

// Navigation mapping: which project page and photo index each reel image goes to
const navigationMap = {
  1: { route: '/work/fashion-project', photoIndex: 4, title: "Heaven's Playground", caption: 'Fashion-Project' },
  2: { route: '/work/portrait-project', photoIndex: 4, title: 'Red Eyes', caption: 'Portrait-Project' },
  3: { route: '/work/portrait-project', photoIndex: 5, title: 'Rest Stop', caption: 'Portrait-Project' },
  4: { route: '/work/fashion-project', photoIndex: 7, title: "Headin' South", caption: 'Fashion-Project' },
  5: { route: '/work/urbangeometry-project', title: "Nature's Architect", caption: 'Urban-Geometry-Project' },
  6: { route: '/work/portrait-project', title: 'Misty Blues', caption: 'Portrait-Project' },
  7: { route: '/work/fashion-project', title: 'Viva las Vegas', caption: 'Fashion-Project' },
  8: { route: '/work/fashion-project', photoIndex: 3, title: 'Viva las Vegas', caption: 'Fashion-Project' }
};

const images = [
  { id: 1, srcBase: getAssetBase(assetHashes[0]), width: 875 },
  { id: 2, srcBase: getAssetBase(assetHashes[1]), width: 875 },
  { id: 3, srcBase: getAssetBase(assetHashes[2]), width: 875 },
  { id: 4, srcBase: getAssetBase(assetHashes[3]), width: 875 },
  { id: 5, srcBase: getAssetBase(assetHashes[4]), width: 875 },
  { id: 6, srcBase: getAssetBase(assetHashes[5]), width: 875 },
  { id: 7, srcBase: getAssetBase(assetHashes[6]), width: 875 },
  { id: 8, srcBase: getAssetBase(assetHashes[7]), width: 396 },
];

const Reel = forwardRef(function Reel({ onScrollUpdate, isManualScrolling, manualScrollPosition, onWheelScroll }, ref) {
  const navigate = useNavigate();
  const reelRef = useRef(null);
  const animationRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const cycleLengthRef = useRef(0);
  const wheelTimeoutRef = useRef(null);
  const touchStartXRef = useRef(null);
  const touchTimeoutRef = useRef(null);
  const isAutoScrollingRef = useRef(false);
  const startTimeRef = useRef(null);
  const transitionDuration = 3000; // 3 seconds
  const initialSpeed = 40; // Very fast initial speed
  const normalSpeed = 1.0; // Normal scrolling speed

  // Handle image click navigation
  const handleImageClick = (imageId) => {
    const navInfo = navigationMap[imageId];
    if (navInfo) {
      navigate(navInfo.route, { state: { scrollToPhotoIndex: navInfo.photoIndex } });
    }
  };

  // Calculate cycle length from actual rendered DOM elements
  // Initialize reel to start flush left at position 0
  useEffect(() => {
    const reel = reelRef.current;
    if (reel) {
      // Wait for DOM to be fully rendered
      requestAnimationFrame(() => {
        const frames = reel.querySelectorAll('.reel-frame');
        const gap = 32; // gap between frames

        // Calculate one complete cycle: first 8 frames + gaps
        let cycleLength = 0;
        for (let i = 0; i < 8 && i < frames.length; i++) {
          cycleLength += frames[i].offsetWidth + gap;
        }

        cycleLengthRef.current = cycleLength;

        // Start at position 0 (first image flush left)
        reel.scrollLeft = 0;
        scrollPositionRef.current = 0;
      });
    }
  }, []);

  useImperativeHandle(ref, () => ({
    scrollTo: (position) => {
      if (reelRef.current) {
        reelRef.current.scrollLeft = position;
        scrollPositionRef.current = position;
      }
    },
    getScrollPosition: () => scrollPositionRef.current,
    getMaxScroll: () => {
      if (reelRef.current) {
        return reelRef.current.scrollWidth - reelRef.current.offsetWidth;
      }
      return 0;
    },
    getCycleLength: () => cycleLengthRef.current
  }));

  // Handle manual scroll position updates
  useEffect(() => {
    if (isManualScrolling && manualScrollPosition !== null && manualScrollPosition !== undefined) {
      const reel = reelRef.current;
      if (reel) {
        // manualScrollPosition is cycle progress (0-1), convert to scroll position
        const cycleLength = cycleLengthRef.current;
        const scrollPos = manualScrollPosition * cycleLength;
        reel.scrollLeft = scrollPos;
        scrollPositionRef.current = scrollPos;
      }
    }
  }, [isManualScrolling, manualScrollPosition]);

  // Handle mouse wheel scrolling
  useEffect(() => {
    const reel = reelRef.current;
    if (!reel) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const currentScroll = reel.scrollLeft;
      let scrollDelta = 0;

      // Handle horizontal scrolling (touchpad left/right)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        scrollDelta = e.deltaX;
      }
      // Handle vertical scrolling (mouse wheel up/down)
      // Scroll down (positive deltaY) → move reel right (positive delta)
      // Scroll up (negative deltaY) → move reel left (negative delta)
      else if (Math.abs(e.deltaY) > 0) {
        scrollDelta = e.deltaY;
      }

      const newScroll = Math.max(0, currentScroll + scrollDelta);
      reel.scrollLeft = newScroll;
      scrollPositionRef.current = newScroll;

      // Calculate cycle progress
      const cycleLength = cycleLengthRef.current;
      const cycleProgress = cycleLength > 0 ? ((newScroll % cycleLength) / cycleLength) : 0;

      if (onWheelScroll) {
        onWheelScroll(true, cycleProgress);
      }

      // Clear existing timeout
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
        wheelTimeoutRef.current = null;
      }

      // Set timeout to resume auto-scroll after user stops scrolling
      wheelTimeoutRef.current = setTimeout(() => {
        if (onWheelScroll) {
          onWheelScroll(false, null);
        }
        wheelTimeoutRef.current = null;
      }, 500); // Resume after 500ms of no wheel activity
    };

    reel.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      reel.removeEventListener('wheel', handleWheel);
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
        wheelTimeoutRef.current = null;
      }
    };
  }, [onWheelScroll]);

  // Handle touch scrolling (drag with fingers)
  useEffect(() => {
    const reel = reelRef.current;
    if (!reel) return;

    const handleTouchStart = (e) => {
      touchStartXRef.current = e.touches[0].clientX;

      // Clear any existing timeout
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      }

      // Pause auto-scroll when touch starts
      if (onWheelScroll) {
        const currentScroll = reel.scrollLeft;
        const cycleLength = cycleLengthRef.current;
        const cycleProgress = cycleLength > 0 ? ((currentScroll % cycleLength) / cycleLength) : 0;
        onWheelScroll(true, cycleProgress);
      }
    };

    const handleTouchMove = (e) => {
      if (touchStartXRef.current === null) return;
      
      const currentX = e.touches[0].clientX;
      const deltaX = touchStartXRef.current - currentX;
      
      // Update scroll position
      const newScroll = Math.max(0, reel.scrollLeft + deltaX);
      reel.scrollLeft = newScroll;
      scrollPositionRef.current = newScroll;
      touchStartXRef.current = currentX;
      
      // Calculate cycle progress
      const cycleLength = cycleLengthRef.current;
      const cycleProgress = cycleLength > 0 ? ((newScroll % cycleLength) / cycleLength) : 0;
      
      if (onWheelScroll) {
        onWheelScroll(true, cycleProgress);
      }
      
      // Clear existing timeout
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      }
    };

    const handleTouchEnd = () => {
      touchStartXRef.current = null;
      
      // Clear existing timeout
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      }
      
      // Resume auto-scroll after a short delay
      touchTimeoutRef.current = setTimeout(() => {
        if (onWheelScroll) {
          onWheelScroll(false, null);
        }
        touchTimeoutRef.current = null;
      }, 500);
    };

    reel.addEventListener('touchstart', handleTouchStart, { passive: true });
    reel.addEventListener('touchmove', handleTouchMove, { passive: true });
    reel.addEventListener('touchend', handleTouchEnd, { passive: true });
    reel.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      reel.removeEventListener('touchstart', handleTouchStart);
      reel.removeEventListener('touchmove', handleTouchMove);
      reel.removeEventListener('touchend', handleTouchEnd);
      reel.removeEventListener('touchcancel', handleTouchEnd);
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      }
    };
  }, [onWheelScroll]);

  useEffect(() => {
    if (isManualScrolling) {
      // Cancel animation when manual scrolling
      isAutoScrollingRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const reel = reelRef.current;
    if (!reel) return;

    isAutoScrollingRef.current = true;

    // Initialize start time
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }

    const animate = () => {
      // Double check manual scrolling state
      if (isManualScrolling) {
        isAutoScrollingRef.current = false;
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        return;
      }

      isAutoScrollingRef.current = true;

      // Calculate current speed based on elapsed time
      const elapsed = Date.now() - startTimeRef.current;
      let currentSpeed;

      if (elapsed < transitionDuration) {
        // Gradually slow down using easing function (ease-out)
        const progress = elapsed / transitionDuration;
        const easedProgress = 1 - Math.pow(1 - progress, 2); // ease-out cubic
        currentSpeed = initialSpeed - (initialSpeed - normalSpeed) * easedProgress;
      } else {
        currentSpeed = normalSpeed;
      }

      const cycleLength = cycleLengthRef.current;
      scrollPositionRef.current += currentSpeed;

      // Infinite seamless loop: when we reach the end of one cycle, reset to the start
      // Using modulo ensures we stay within 0 to cycleLength
      if (scrollPositionRef.current >= cycleLength) {
        scrollPositionRef.current = scrollPositionRef.current % cycleLength;
      }

      reel.scrollLeft = scrollPositionRef.current;

      // Calculate cycle progress (0 to 1) - position within one cycle
      const cyclePosition = scrollPositionRef.current % cycleLength;
      const cycleProgress = cycleLength > 0 ? (cyclePosition / cycleLength) : 0;
      onScrollUpdate(cycleProgress, cycleLength);

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      isAutoScrollingRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isManualScrolling, onScrollUpdate]);

  // Duplicate images multiple times for seamless infinite loop
  const duplicatedImages = [...images, ...images, ...images, ...images, ...images, ...images];

  const handleImageError = (e) => {
    const img = e.target;
    // Prevent recursive infinite loops by temporarily clearing onerror
    img.onerror = null;

    // Determine base without extension. Prefer data-base-src when available.
    const base = img.dataset.baseSrc || img.src.replace(/\.[^.]+$/, '');
    const tried = img.dataset.triedExts ? img.dataset.triedExts.split(',') : [];

    // Find next extension to try
    const nextExt = fallbackExts.find(ext => !tried.includes(ext));
    if (nextExt) {
      tried.push(nextExt);
      img.dataset.triedExts = tried.join(',');
      img.src = `${base}${nextExt}`;
      // Reattach error handler for the next attempt
      img.onerror = handleImageError;
      return;
    }

    // All fallbacks exhausted — show inline placeholder
    const id = img.dataset.imageId || '';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='100%' height='100%' fill='#111'/><text x='50%' y='50%' fill='#888' font-family='Arial, Helvetica, sans-serif' font-size='22' dominant-baseline='middle' text-anchor='middle'>Image ${id}</text></svg>`;
    img.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    img.style.background = 'none';
    img.style.display = 'block';
    img.style.objectFit = 'cover';
  };

  const handleImageLoad = (e) => {
    const img = e.target;
    const src = img.currentSrc || img.src;
    // Extract extension for debugging
    const m = src.match(/\.([^.?#]+)(?:[?#]|$)/);
    const ext = m ? m[1] : 'unknown';
    img.dataset.loadedExt = ext;
    // Use console.debug to avoid noisy logs in production
    console.debug(`Reel: Image ${img.dataset.imageId} loaded -> .${ext}`);
  };

  return (
    <div className="reel-container" data-name="Reel" data-node-id="7:297">
      <div className="reel" ref={reelRef} data-name="Selected Works Reel" data-node-id="7:296">
        {duplicatedImages.map((image, index) => {
          const navInfo = navigationMap[image.id];
          const titleText = navInfo?.title || `Image ${image.id}`;
          const captionText = navInfo?.caption || 'Project';

          return (
            <div key={`${image.id}-${index}`} className="reel-frame" data-name="Selected Frame">
              <div className="reel-image-container" onClick={() => handleImageClick(image.id)}>
                <img
                  src={`${image.srcBase}${fallbackExts[0]}`}
                  alt={`Image ${image.id}`}
                  className="reel-image"
                  data-image-id={image.id}
                  data-base-src={image.srcBase}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  loading="lazy"
                />
              </div>
              <div className="reel-caption">
                <div className="caption-title">
                  <p>{titleText}</p>
                </div>
                <div className="caption-direction">
                  <p>{captionText}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default Reel;

