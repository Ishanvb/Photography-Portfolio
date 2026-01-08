import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
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
  const reelRef = useRef(null);
  const animationRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const cycleLengthRef = useRef(0);
  const wheelTimeoutRef = useRef(null);
  const touchStartXRef = useRef(null);
  const touchTimeoutRef = useRef(null);
  const isAutoScrollingRef = useRef(false);

  // Calculate cycle length: sum of widths from image 1 to image 8
  // Initialize reel to start with Image 1 flush on the left
  useEffect(() => {
    const reel = reelRef.current;
    if (reel) {
      const gap = 32; // gap between frames
      const cycleLength = images.reduce((sum, img, idx) => {
        return sum + img.width + (idx < images.length - 1 ? gap : 0);
      }, 0);
      cycleLengthRef.current = cycleLength;
      
      // Start with the first frame centered (Option C)
      requestAnimationFrame(() => {
        const firstFrame = reel.querySelector('.reel-frame');
        if (firstFrame) {
          const containerWidth = reel.offsetWidth;
          const frameLeft = firstFrame.offsetLeft;
          const frameWidth = firstFrame.offsetWidth;
          const target = Math.max(0, frameLeft - (containerWidth - frameWidth) / 2);
          reel.scrollLeft = target;
          scrollPositionRef.current = target;
        } else {
          // fallback to left if DOM not ready
          reel.scrollLeft = 0;
          scrollPositionRef.current = 0;
        }
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
      // Only handle horizontal scrolling
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        const currentScroll = reel.scrollLeft;
        const newScroll = Math.max(0, currentScroll + e.deltaX);
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
      }
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

    const scrollSpeed = 1.5; // pixels per frame
    const reel = reelRef.current;
    if (!reel) return;

      isAutoScrollingRef.current = true;

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
      scrollPositionRef.current += scrollSpeed;
      const cycleLength = cycleLengthRef.current;
      
      // For infinite seamless loop: when we reach near the end, reset to beginning
      // We use duplicated content so the transition is seamless
      if (scrollPositionRef.current >= cycleLength * 2) {
        // Reset to beginning of second set (which looks identical to first)
        scrollPositionRef.current = scrollPositionRef.current - cycleLength;
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
  const duplicatedImages = [...images, ...images, ...images, ...images];

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
        {duplicatedImages.map((image, index) => (
          <div key={`${image.id}-${index}`} className="reel-frame" data-name="Selected Frame">
            <div className="reel-image-container">
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
                <p>Title</p>
              </div>
              <div className="caption-direction">
                <p>Creative Direction (ie Landscape, Portrait, ect.)</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default Reel;

