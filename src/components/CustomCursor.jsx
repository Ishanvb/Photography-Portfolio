import { useEffect, useRef, useState } from 'react';
import * as S from '~/components/CustomCursor.styled';

// Detect if device is touch-only (no hover capability)
const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
};

export default function CustomCursor() {
  // Read straight off the media query — isTouchDevice() guards for no window.
  const [isTouch, setIsTouch] = useState(isTouchDevice);
  const cursorRef = useRef(null);
  const textRef = useRef(null);
  const arrowRef = useRef(null);
  const playIconRef = useRef(null);
  const pauseIconRef = useRef(null);
  const muteIconRef = useRef(null);
  const unmuteIconRef = useRef(null);
  const meIconRef = useRef(null);
  const schoolIconRef = useRef(null);
  const fashionIconRef = useRef(null);
  const aboutMeIconRef = useRef(null);
  const iconContainerRef = useRef(null);

  // Keep up with a device gaining or losing a pointer (rotation, a mouse being
  // plugged in) — the initial value comes from useState above.
  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: none) and (pointer: coarse)');
    const handleChange = (e) => setIsTouch(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Skip all event listeners on touch devices
    if (isTouch) return;
    const cursor = cursorRef.current;
    const text = textRef.current;
    const arrowIcon = arrowRef.current;
    const playIcon = playIconRef.current;
    const pauseIcon = pauseIconRef.current;
    const muteIcon = muteIconRef.current;
    const unmuteIcon = unmuteIconRef.current;
    const meIcon = meIconRef.current;
    const schoolIcon = schoolIconRef.current;
    const fashionIcon = fashionIconRef.current;
    const aboutMeIcon = aboutMeIconRef.current;
    const iconContainer = iconContainerRef.current;

    let targetX = 0;
    let targetY = 0;
    // Where the cursor is drawn. It closes on the pointer with a time constant
    // of a few milliseconds: short enough that there is no visible lag or
    // coasting, long enough that it still moves on frames where no new mouse
    // position arrived — which is most of them on a 120Hz screen, and what made
    // an unsmoothed cursor step along at half the display's rate.
    let x = null;
    let y = null;
    let lastFrame = 0;
    const FOLLOW_MS = 6;
    let animationId;
    let isAnimating = false;
    let idleTimer = null;
    let isMagnetic = false;
    let magnetTarget = null;
    // Whatever the pointer is currently over that has changed the cursor.
    let hoverTarget = null;
    let isOverVideo = false;
    let currentVideoContainer = null;
    let isOverMuteBtn = false;
    let currentMuteBtn = null;
    let isOverProgressBar = false;
    let currentProgressBar = null;
    let isDraggingProgress = false;
    // The day/night switch: the cursor sinks into the sun, and rings the moon.
    let toggleTarget = null;
    const magnetRadius = 80; // Distance at which magnetic effect starts
    const magnetStrength = 0.3; // How strongly cursor is pulled (0-1)
    const muteRadius = 50; // Magnetic radius for mute button
    const videoInnerPadding = 80; // Play/pause only active this far inside video edges

    // Check if cursor is inside the inner zone of a video (40px from edges)
    const isInVideoInnerZone = (mouseX, mouseY, videoContainer) => {
      if (!videoContainer) return false;
      const video = videoContainer.querySelector('video');
      if (!video) return false;

      const rect = video.getBoundingClientRect();
      return (
        mouseX >= rect.left + videoInnerPadding &&
        mouseX <= rect.right - videoInnerPadding &&
        mouseY >= rect.top + videoInnerPadding &&
        mouseY <= rect.bottom - videoInnerPadding
      );
    };

    const startAnimation = () => {
      if (!isAnimating) {
        isAnimating = true;
        animationId = requestAnimationFrame(animate);
      }
      // Reset idle timer - pause animation after 2s of no movement
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        isAnimating = false;
        cancelAnimationFrame(animationId);
      }, 2000);
    };

    const handleMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      cursor.classList.remove('hidden');
      startAnimation();

      // Check if in video inner zone for play/pause cursor
      let isInInnerZone = false;
      if (isOverVideo && currentVideoContainer) {
        isInInnerZone = isInVideoInnerZone(e.clientX, e.clientY, currentVideoContainer);

        // Only show video cursor if in inner zone and not over controls
        if (isInInnerZone && !isOverMuteBtn && !isOverProgressBar) {
          const video = currentVideoContainer.querySelector('video');
          if (video) {
            cursor.classList.add('video-cursor');
            updateVideoIcon(video);
          }
        } else {
          cursor.classList.remove('video-cursor');
          playIcon.classList.remove('visible');
          pauseIcon.classList.remove('visible');
        }
      }

      // Handle progress bar dragging
      if (isDraggingProgress && currentProgressBar) {
        const rect = currentProgressBar.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const videoContainer = currentProgressBar.closest('[data-cursor-video]');
        if (videoContainer) {
          const video = videoContainer.querySelector('video');
          if (video && video.duration) {
            video.currentTime = percentage * video.duration;
          }
        }
      }

      // Check for mute buttons (magnetic) — uses cached array instead of querySelectorAll
      const muteElements = cachedMuteElements;
      let closestMute = null;
      let closestMuteDistance = Infinity;

      muteElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
          Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
        );

        if (distance < muteRadius && distance < closestMuteDistance) {
          closestMuteDistance = distance;
          closestMute = { el, centerX, centerY, distance };
        }
      });

      if (closestMute) {
        isOverMuteBtn = true;
        currentMuteBtn = closestMute;
        cursor.classList.add('mute-cursor');
        closestMute.el.classList.add('cursor-nearby');

        // Show opposite icon based on current mute state
        const isMuted = closestMute.el.dataset.muted === 'true';
        if (isMuted) {
          // Currently muted, show unmute (sound) icon
          unmuteIcon.classList.add('visible');
          muteIcon.classList.remove('visible');
        } else {
          // Currently has sound, show mute icon
          muteIcon.classList.add('visible');
          unmuteIcon.classList.remove('visible');
        }
      } else {
        if (isOverMuteBtn && currentMuteBtn) {
          currentMuteBtn.el.classList.remove('cursor-nearby');
        }
        isOverMuteBtn = false;
        currentMuteBtn = null;
        cursor.classList.remove('mute-cursor');
        muteIcon.classList.remove('visible');
        unmuteIcon.classList.remove('visible');
      }

      // Check for progress bars — uses cached array instead of querySelectorAll
      const progressElements = cachedProgressElements;
      let isOverAnyProgress = false;
      let hoveredProgressBar = null;

      progressElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Simple bounding box check with small padding
        if (
          e.clientX >= rect.left - 10 &&
          e.clientX <= rect.right + 10 &&
          e.clientY >= rect.top - 10 &&
          e.clientY <= rect.bottom + 10
        ) {
          isOverAnyProgress = true;
          hoveredProgressBar = el;
        }
      });

      if (isOverAnyProgress && !isOverMuteBtn) {
        isOverProgressBar = true;
        currentProgressBar = hoveredProgressBar;
        cursor.classList.add('progress-cursor');
        hoveredProgressBar.classList.add('cursor-nearby');
      } else if (!isDraggingProgress) {
        if (isOverProgressBar && currentProgressBar) {
          currentProgressBar.classList.remove('cursor-nearby');
        }
        isOverProgressBar = false;
        currentProgressBar = null;
        cursor.classList.remove('progress-cursor');
      }

      // Check for magnetic targets — uses cached array instead of querySelectorAll
      const magnetElements = cachedMagnetElements;
      let closestMagnet = null;
      let closestDistance = Infinity;

      magnetElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
          Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
        );

        if (distance < magnetRadius && distance < closestDistance) {
          closestDistance = distance;
          closestMagnet = { el, centerX, centerY, distance };
        }
      });

      if (closestMagnet && !isOverMuteBtn && !isOverProgressBar) {
        isMagnetic = true;
        magnetTarget = closestMagnet;
        cursor.classList.add('magnetic');
        closestMagnet.el.classList.add('cursor-nearby');

        // Check if dropdown is open
        const dropdown = closestMagnet.el.closest('[data-category-dropdown]');
        if (dropdown && dropdown.dataset.categoryDropdown === 'open') {
          arrowIcon.classList.add('flipped');
        } else {
          arrowIcon.classList.remove('flipped');
        }
      } else {
        if (isMagnetic && magnetTarget) {
          magnetTarget.el.classList.remove('cursor-nearby');
        }
        isMagnetic = false;
        magnetTarget = null;
        cursor.classList.remove('magnetic');
        arrowIcon.classList.remove('flipped');
      }
    };

    const animate = (now) => {
      let finalX = targetX;
      let finalY = targetY;

      // Apply magnetic pull for mute button
      if (isOverMuteBtn && currentMuteBtn) {
        const pullStrength = 1 - (currentMuteBtn.distance / muteRadius);
        const adjustedStrength = magnetStrength + (pullStrength * 0.7);
        finalX = targetX + (currentMuteBtn.centerX - targetX) * adjustedStrength;
        finalY = targetY + (currentMuteBtn.centerY - targetY) * adjustedStrength;
      }
      // Ringing the moon: sit dead on its centre.
      else if (toggleTarget && cursor.classList.contains('toggle-ring')) {
        const rect = toggleTarget.getBoundingClientRect();
        finalX = rect.left + rect.width / 2;
        finalY = rect.top + rect.height / 2;
      }
      // No magnetic pull for progress bar - just show smaller cursor
      // Apply magnetic pull if near a dropdown arrow
      else if (isMagnetic && magnetTarget) {
        const pullStrength = 1 - (magnetTarget.distance / magnetRadius);
        const adjustedStrength = magnetStrength + (pullStrength * 0.7);
        finalX = targetX + (magnetTarget.centerX - targetX) * adjustedStrength;
        finalY = targetY + (magnetTarget.centerY - targetY) * adjustedStrength;
      }

      // Frame-rate independent: the same feel at 60Hz or 120Hz.
      const dt = lastFrame ? Math.min(now - lastFrame, 100) : 1000;
      lastFrame = now;
      const follow = 1 - Math.exp(-dt / FOLLOW_MS);
      x = x === null ? finalX : x + (finalX - x) * follow;
      y = y === null ? finalY : y + (finalY - y) * follow;
      if (Math.abs(finalX - x) < 0.1) x = finalX;
      if (Math.abs(finalY - y) < 0.1) y = finalY;
      // Moved on the compositor: left/top would re-run layout every frame.
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      if (isAnimating) {
        animationId = requestAnimationFrame(animate);
      }
    };

    const handleMouseEnter = (e) => {
      const label = e.currentTarget.dataset.cursor;
      if (!label) return; // Don't activate if attribute was removed
      hoverTarget = e.currentTarget;
      // Some targets swallow the cursor whole and become it themselves.
      if (e.currentTarget.dataset.cursorVariant === 'merge') {
        cursor.classList.add('merged');
        return;
      }

      cursor.classList.add('active');
      text.textContent = label;

      // Check for icon
      const iconType = e.currentTarget.dataset.cursorIcon;
      if (iconType) {
        iconContainer.classList.add('visible');
        // Show the appropriate icon
        if (iconType === 'school') {
          schoolIcon.classList.add('visible');
        } else if (iconType === 'fashion') {
          fashionIcon.classList.add('visible');
        } else if (iconType === 'me') {
          aboutMeIcon.classList.add('visible');
        }
      }
    };

    const handleMouseLeave = () => {
      hoverTarget = null;
      cursor.classList.remove('active');
      cursor.classList.remove('merged');
      text.textContent = '';

      // Hide icons
      iconContainer.classList.remove('visible');
      schoolIcon.classList.remove('visible');
      fashionIcon.classList.remove('visible');
      aboutMeIcon.classList.remove('visible');
    };

    const handleClick = (e) => {
      // Reset cursor to original state when clicking
      if (e.currentTarget.dataset.cursor) {
        cursor.classList.remove('active');
        cursor.classList.remove('merged');
        text.textContent = '';
        // Hide icons
        iconContainer.classList.remove('visible');
        schoolIcon.classList.remove('visible');
        fashionIcon.classList.remove('visible');
        aboutMeIcon.classList.remove('visible');
      }
    };

    // Video cursor handlers
    const updateVideoIcon = (video) => {
      if (video.paused) {
        playIcon.classList.add('visible');
        pauseIcon.classList.remove('visible');
      } else {
        playIcon.classList.remove('visible');
        pauseIcon.classList.add('visible');
      }
    };

    const handleVideoEnter = (e) => {
      const container = e.currentTarget;
      const video = container.querySelector('video');
      if (video) {
        isOverVideo = true;
        currentVideoContainer = container;
        // Video cursor is now managed in handleMouseMove based on inner zone
      }
    };

    const handleVideoLeave = () => {
      isOverVideo = false;
      currentVideoContainer = null;
      cursor.classList.remove('video-cursor');
      playIcon.classList.remove('visible');
      pauseIcon.classList.remove('visible');
    };

    const handleVideoClick = (e) => {
      // Don't toggle play/pause if over controls
      if (isOverMuteBtn || isOverProgressBar || isDraggingProgress) {
        return;
      }

      // Only toggle if in inner zone
      if (isOverVideo && currentVideoContainer) {
        const isInInnerZone = isInVideoInnerZone(e.clientX, e.clientY, currentVideoContainer);
        if (!isInInnerZone) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        const video = currentVideoContainer.querySelector('video');
        if (video) {
          if (video.paused) {
            video.play();
          } else {
            video.pause();
          }
          updateVideoIcon(video);
        }
      }
    };

    // "Me" photo cursor handlers
    const handleMeEnter = (e) => {
      hoverTarget = e.currentTarget;
      cursor.classList.add('me-cursor');
      meIcon.classList.add('visible');
    };

    const handleMeLeave = () => {
      hoverTarget = null;
      cursor.classList.remove('me-cursor');
      meIcon.classList.remove('visible');
    };


    // Header button cursor handlers
    const handleHeaderEnter = (e) => {
      hoverTarget = e.currentTarget;
      cursor.classList.add('header-cursor');
    };

    const handleHeaderLeave = () => {
      hoverTarget = null;
      cursor.classList.remove('header-cursor');
    };

    // Day/night switch. Its mode flips while the pointer is still on it, so
    // this is re-run after a click and whenever its data attribute changes.
    const updateToggleCursor = () => {
      if (!toggleTarget) return;
      const isMoon = toggleTarget.dataset.cursorToggle === 'moon';
      cursor.classList.toggle('toggle-ring', isMoon);
      cursor.classList.toggle('merged', !isMoon);
      // The mouse may not move again, so keep the loop running until the
      // ring has slid onto the moon.
      if (isMoon) startAnimation();
    };

    const handleToggleEnter = (e) => {
      hoverTarget = e.currentTarget;
      toggleTarget = e.currentTarget;
      updateToggleCursor();
      startAnimation();
    };

    const handleToggleLeave = () => {
      hoverTarget = null;
      toggleTarget = null;
      cursor.classList.remove('toggle-ring', 'merged');
    };

    // YouTube video cursor handlers (slightly bigger cursor)
    const handleYoutubeEnter = (e) => {
      hoverTarget = e.currentTarget;
      cursor.classList.add('youtube-cursor');
    };

    const handleYoutubeLeave = () => {
      hoverTarget = null;
      cursor.classList.remove('youtube-cursor');
    };

    const handleDocumentLeave = (e) => {
      // Hide cursor when mouse leaves the document
      if (e.clientY <= 0 || e.clientX <= 0 ||
          e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        cursor.classList.add('hidden');
      }
    };

    const handleMagneticClick = (e) => {
      // Handle mute button click
      if (isOverMuteBtn && currentMuteBtn) {
        currentMuteBtn.el.click();

        // Update icon after click
        setTimeout(() => {
          const isMuted = currentMuteBtn.el.dataset.muted === 'true';
          if (isMuted) {
            unmuteIcon.classList.add('visible');
            muteIcon.classList.remove('visible');
          } else {
            muteIcon.classList.add('visible');
            unmuteIcon.classList.remove('visible');
          }
        }, 10);
        return;
      }

      // If cursor is in magnetic state, trigger click on the magnetic target.
      // Only when the click landed beside it — a click that already hit the
      // target has fired it once, and firing it again would undo the toggle.
      if (isMagnetic && magnetTarget && !magnetTarget.el.contains(e.target)) {
        magnetTarget.el.click();

        // Immediately toggle the arrow flip state after click
        // Use setTimeout to let React state update first
        setTimeout(() => {
          const dropdown = magnetTarget.el.closest('[data-category-dropdown]');
          if (dropdown && dropdown.dataset.categoryDropdown === 'open') {
            arrowIcon.classList.add('flipped');
          } else {
            arrowIcon.classList.remove('flipped');
          }
        }, 10);
      }
    };

    const handleMouseDown = (e) => {
      // Start dragging progress bar
      if (isOverProgressBar && currentProgressBar) {
        isDraggingProgress = true;
        cursor.classList.add('dragging');

        // Immediately seek to click position
        const rect = currentProgressBar.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const videoContainer = currentProgressBar.closest('[data-cursor-video]');
        if (videoContainer) {
          const video = videoContainer.querySelector('video');
          if (video && video.duration) {
            video.currentTime = percentage * video.duration;
          }
        }
      }
    };

    const handleMouseUp = () => {
      if (isDraggingProgress) {
        isDraggingProgress = false;
        cursor.classList.remove('dragging');
        // Video cursor restoration is handled in handleMouseMove
      }
    };

    const bindCursorTargets = () => {
      document.querySelectorAll('[data-cursor]').forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
        el.removeEventListener('click', handleClick);
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
        el.addEventListener('click', handleClick);
      });

      // Bind video containers
      document.querySelectorAll('[data-cursor-video]').forEach((el) => {
        el.removeEventListener('mouseenter', handleVideoEnter);
        el.removeEventListener('mouseleave', handleVideoLeave);
        el.removeEventListener('click', handleVideoClick);
        el.addEventListener('mouseenter', handleVideoEnter);
        el.addEventListener('mouseleave', handleVideoLeave);
        el.addEventListener('click', handleVideoClick);
      });

      // Bind "Me" cursor targets
      document.querySelectorAll('[data-cursor-me]').forEach((el) => {
        el.removeEventListener('mouseenter', handleMeEnter);
        el.removeEventListener('mouseleave', handleMeLeave);
        el.addEventListener('mouseenter', handleMeEnter);
        el.addEventListener('mouseleave', handleMeLeave);
      });

      // Bind header button cursor targets
      document.querySelectorAll('[data-cursor-header]').forEach((el) => {
        el.removeEventListener('mouseenter', handleHeaderEnter);
        el.removeEventListener('mouseleave', handleHeaderLeave);
        el.addEventListener('mouseenter', handleHeaderEnter);
        el.addEventListener('mouseleave', handleHeaderLeave);
      });

      // Bind YouTube video cursor targets (slightly bigger cursor)
      document.querySelectorAll('[data-cursor-youtube]').forEach((el) => {
        el.removeEventListener('mouseenter', handleYoutubeEnter);
        el.removeEventListener('mouseleave', handleYoutubeLeave);
        el.addEventListener('mouseenter', handleYoutubeEnter);
        el.addEventListener('mouseleave', handleYoutubeLeave);
      });

      // Bind the day/night switch
      document.querySelectorAll('[data-cursor-toggle]').forEach((el) => {
        el.removeEventListener('mouseenter', handleToggleEnter);
        el.removeEventListener('mouseleave', handleToggleLeave);
        el.addEventListener('mouseenter', handleToggleEnter);
        el.addEventListener('mouseleave', handleToggleLeave);
      });

    };

    // Initial binding
    document.addEventListener('mousemove', handleMouseMove);
    // Chrome reports the pointer as soon as the hardware does, rather than
    // once per frame. Only the position is read here; everything else stays on
    // mousemove.
    const handleRawMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };
    const hasRawUpdate = 'onpointerrawupdate' in window;
    if (hasRawUpdate) document.addEventListener('pointerrawupdate', handleRawMove);
    document.addEventListener('mouseout', handleDocumentLeave);
    document.addEventListener('click', handleMagneticClick);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    bindCursorTargets();

    // Watch for DOM changes to bind new elements (debounced)
    // Cache element queries so handleMouseMove doesn't call querySelectorAll on every frame
    let cachedMuteElements = Array.from(document.querySelectorAll('[data-cursor-mute]'));
    let cachedProgressElements = Array.from(document.querySelectorAll('[data-cursor-progress]'));
    let cachedMagnetElements = Array.from(document.querySelectorAll('[data-cursor-magnet]'));

    /**
     * Every page renders its own header, so navigating unmounts the very button
     * the pointer is sitting on. No mouseleave is fired for an element that is
     * simply gone, which used to leave the cursor stuck at its inflated size
     * until you found another target to enter and leave. If whatever put it
     * there is no longer in the document, put it back.
     */
    const resetIfTargetGone = () => {
      if (!hoverTarget || hoverTarget.isConnected) return;
      hoverTarget = null;
      toggleTarget = null;
      cursor.classList.remove(
        'active', 'merged', 'header-cursor', 'youtube-cursor', 'me-cursor', 'toggle-ring'
      );
      text.textContent = '';
      iconContainer.classList.remove('visible');
      schoolIcon.classList.remove('visible');
      fashionIcon.classList.remove('visible');
      aboutMeIcon.classList.remove('visible');
      meIcon.classList.remove('visible');
    };

    let mutationTimer = null;
    const observer = new MutationObserver(() => {
      clearTimeout(mutationTimer);
      mutationTimer = setTimeout(() => {
        resetIfTargetGone();
        updateToggleCursor();
        bindCursorTargets();
        // Refresh cached element arrays after DOM mutation
        cachedMuteElements = Array.from(document.querySelectorAll('[data-cursor-mute]'));
        cachedProgressElements = Array.from(document.querySelectorAll('[data-cursor-progress]'));
        cachedMagnetElements = Array.from(document.querySelectorAll('[data-cursor-magnet]'));
      }, 150);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        'data-cursor',
        'data-cursor-variant',
        'data-cursor-mute',
        'data-cursor-progress',
        'data-cursor-magnet',
        'data-cursor-toggle'
      ]
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (hasRawUpdate) document.removeEventListener('pointerrawupdate', handleRawMove);
      document.removeEventListener('mouseout', handleDocumentLeave);
      document.removeEventListener('click', handleMagneticClick);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      isAnimating = false;
      cancelAnimationFrame(animationId);
      clearTimeout(idleTimer);
      clearTimeout(mutationTimer);
      observer.disconnect();
      document.querySelectorAll('[data-cursor]').forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
        el.removeEventListener('click', handleClick);
      });
      document.querySelectorAll('[data-cursor-magnet]').forEach((el) => {
        el.classList.remove('cursor-nearby');
      });
      document.querySelectorAll('[data-cursor-video]').forEach((el) => {
        el.removeEventListener('mouseenter', handleVideoEnter);
        el.removeEventListener('mouseleave', handleVideoLeave);
        el.removeEventListener('click', handleVideoClick);
      });
      document.querySelectorAll('[data-cursor-mute]').forEach((el) => {
        el.classList.remove('cursor-nearby');
      });
      document.querySelectorAll('[data-cursor-progress]').forEach((el) => {
        el.classList.remove('cursor-nearby');
      });
      document.querySelectorAll('[data-cursor-me]').forEach((el) => {
        el.removeEventListener('mouseenter', handleMeEnter);
        el.removeEventListener('mouseleave', handleMeLeave);
      });
      document.querySelectorAll('[data-cursor-header]').forEach((el) => {
        el.removeEventListener('mouseenter', handleHeaderEnter);
        el.removeEventListener('mouseleave', handleHeaderLeave);
      });
      document.querySelectorAll('[data-cursor-youtube]').forEach((el) => {
        el.removeEventListener('mouseenter', handleYoutubeEnter);
        el.removeEventListener('mouseleave', handleYoutubeLeave);
      });
      document.querySelectorAll('[data-cursor-toggle]').forEach((el) => {
        el.removeEventListener('mouseenter', handleToggleEnter);
        el.removeEventListener('mouseleave', handleToggleLeave);
      });
    };
  }, [isTouch]);

  // Don't render anything on touch devices
  if (isTouch) return null;

  return (
    <>
      <S.HideCursorGlobal />
      <S.CursorWrapper ref={cursorRef}>
        <div ref={iconContainerRef} className="cursor-icon-container">
          <svg ref={schoolIconRef} className="cursor-icon cursor-icon-school" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M11.063 2.46901C11.309 2.27225 11.6108 2.15796 11.9254 2.14235C12.2401 2.12673 12.5517 2.21058 12.816 2.38201L12.937 2.46901L17.249 5.91901C17.4594 6.08715 17.6336 6.29606 17.7613 6.53319C17.889 6.77033 17.9675 7.03081 17.992 7.29901L18 7.48001V19H19V10.5C19 10.383 19.041 10.2696 19.1159 10.1797C19.1908 10.0898 19.2949 10.0291 19.41 10.008L19.5 10H20C20.5046 9.99985 20.9906 10.1904 21.3605 10.5335C21.7305 10.8766 21.9572 11.3469 21.995 11.85L22 12V19.9C21.9999 20.1709 21.8998 20.4322 21.719 20.6339C21.5382 20.8356 21.2893 20.9635 21.02 20.993L20.9 21H3.1C2.82894 21.0001 2.56738 20.9002 2.36548 20.7193C2.16358 20.5385 2.03557 20.2894 2.006 20.02L2 19.9V12C1.99984 11.4954 2.19041 11.0094 2.5335 10.6395C2.87659 10.2695 3.34684 10.0428 3.85 10.005L4 10H4.5C4.61703 9.99997 4.73036 10.041 4.82026 10.1159C4.91016 10.1908 4.97094 10.2949 4.992 10.41L5 10.5V19H6V7.48001C5.99998 7.21069 6.05436 6.94415 6.15987 6.69636C6.26537 6.44857 6.41984 6.22464 6.614 6.03801L6.751 5.91801L11.063 2.46901ZM12 8.99901C11.4696 8.99901 10.9609 9.20972 10.5858 9.58479C10.2107 9.95986 10 10.4686 10 10.999C10 11.5294 10.2107 12.0381 10.5858 12.4132C10.9609 12.7883 11.4696 12.999 12 12.999C12.5304 12.999 13.0391 12.7883 13.4142 12.4132C13.7893 12.0381 14 11.5294 14 10.999C14 10.4686 13.7893 9.95986 13.4142 9.58479C13.0391 9.20972 12.5304 8.99901 12 8.99901Z" fill="currentColor"/>
          </svg>
          <svg ref={fashionIconRef} className="cursor-icon cursor-icon-fashion" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M11 7.50005C11.0001 7.31928 11.0493 7.14194 11.1422 6.98687C11.2351 6.83181 11.3683 6.70482 11.5276 6.61943C11.6869 6.53403 11.8664 6.49342 12.047 6.50191C12.2275 6.51041 12.4024 6.56768 12.553 6.66765C12.7036 6.76763 12.8243 6.90655 12.9023 7.06965C12.9802 7.23275 13.0125 7.41393 12.9957 7.59391C12.9788 7.77389 12.9135 7.94594 12.8067 8.09176C12.6999 8.23759 12.5555 8.35173 12.389 8.42205C11.817 8.66405 10.969 9.22605 10.639 10.168L2.176 16.938C0.700005 18.12 1.535 20.5 3.426 20.5H20.575C22.465 20.5 23.3 18.12 21.824 16.938L14.2 10.84C14.7781 10.4593 15.2475 9.93511 15.5624 9.31863C15.8772 8.70215 16.0266 8.01453 15.9961 7.32299C15.9656 6.63145 15.7561 5.95967 15.3882 5.37333C15.0203 4.78699 14.5065 4.30617 13.8971 3.97787C13.2877 3.64958 12.6035 3.48505 11.9115 3.50037C11.2194 3.51569 10.5432 3.71035 9.94891 4.0653C9.35463 4.42025 8.86263 4.92334 8.52102 5.52539C8.17941 6.12744 7.99989 6.80784 8 7.50005C8 7.89787 8.15804 8.2794 8.43934 8.56071C8.72065 8.84201 9.10218 9.00005 9.5 9.00005C9.89783 9.00005 10.2794 8.84201 10.5607 8.56071C10.842 8.2794 11 7.89787 11 7.50005ZM12 12.92L17.724 17.5H6.276L12 12.92Z" fill="currentColor"/>
          </svg>
          <svg ref={aboutMeIconRef} className="cursor-icon cursor-icon-me" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 13C14.396 13 16.575 13.694 18.178 14.672C18.978 15.16 19.662 15.736 20.156 16.362C20.642 16.977 21 17.713 21 18.5C21 19.345 20.589 20.011 19.997 20.486C19.437 20.936 18.698 21.234 17.913 21.442C16.335 21.859 14.229 22 12 22C9.771 22 7.665 21.86 6.087 21.442C5.302 21.234 4.563 20.936 4.003 20.486C3.41 20.01 3 19.345 3 18.5C3 17.713 3.358 16.977 3.844 16.361C4.338 15.736 5.021 15.161 5.822 14.671C7.425 13.695 9.605 13 12 13ZM12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7C17 8.32608 16.4732 9.59785 15.5355 10.5355C14.5979 11.4732 13.3261 12 12 12C10.6739 12 9.40215 11.4732 8.46447 10.5355C7.52678 9.59785 7 8.32608 7 7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2Z" fill="currentColor"/>
          </svg>
        </div>
        <span ref={textRef} />
        <div ref={arrowRef} className="cursor-arrow" />
        <div ref={playIconRef} className="cursor-play" />
        <div ref={pauseIconRef} className="cursor-pause" />
        {/* Mute icon (shown when video has sound - clicking will mute) */}
        <svg ref={muteIconRef} className="cursor-mute" xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 20 18" fill="none">
          <path d="M2.596 4.90664L13 15.3106V16.7126C13.0001 16.9148 12.9444 17.1132 12.8391 17.2858C12.7338 17.4584 12.583 17.5987 12.4031 17.6912C12.2233 17.7837 12.0215 17.8248 11.8198 17.8101C11.6182 17.7953 11.4245 17.7253 11.26 17.6076L4.68 12.9066H2C1.46957 12.9066 0.960859 12.6959 0.585786 12.3208C0.210714 11.9458 0 11.4371 0 10.9066V6.90664C0 6.3762 0.210714 5.86749 0.585786 5.49242C0.960859 5.11735 1.46957 4.90664 2 4.90664H2.596ZM13 1.10064V10.4926L14.113 11.6056C14.02 11.4275 13.9828 11.2254 14.0064 11.0258C14.0299 10.8262 14.1131 10.6383 14.245 10.4866L14.333 10.3976C14.743 10.0296 15 9.49864 15 8.90664C15.0012 8.39454 14.8049 7.90171 14.452 7.53063L14.333 7.41564C14.1382 7.23799 14.0215 6.99062 14.0082 6.72735C13.9949 6.46407 14.086 6.20619 14.2619 6.00979C14.4377 5.81339 14.684 5.69437 14.9471 5.67861C15.2103 5.66285 15.469 5.75163 15.667 5.92564C16.0867 6.30053 16.4224 6.7599 16.6522 7.27364C16.8819 7.78738 17.0004 8.34387 17 8.90664C17.0006 9.46943 16.8822 10.026 16.6524 10.5397C16.4227 11.0535 16.0869 11.5129 15.667 11.8876C15.5155 12.0235 15.3261 12.1098 15.1242 12.1352C14.9223 12.1606 14.7174 12.1238 14.537 12.0296L16.007 13.4996C15.9875 13.3397 16.0069 13.1774 16.0637 13.0266C16.1205 12.8758 16.2129 12.741 16.333 12.6336C16.8582 12.1653 17.2782 11.591 17.5656 10.9486C17.8529 10.3063 18.0009 9.61033 18 8.90664C18 7.42664 17.358 6.09664 16.333 5.17964C16.2338 5.09244 16.1528 4.98644 16.0948 4.86777C16.0367 4.7491 16.0028 4.6201 15.9949 4.48824C15.987 4.35637 16.0053 4.22425 16.0487 4.0995C16.0922 3.97475 16.1599 3.85984 16.2481 3.76142C16.3362 3.663 16.4429 3.58301 16.5621 3.52608C16.6813 3.46915 16.8106 3.4364 16.9426 3.42973C17.0745 3.42305 17.2064 3.44258 17.3308 3.4872C17.4551 3.53181 17.5694 3.60061 17.667 3.68964C18.4017 4.34559 18.9894 5.14951 19.3915 6.04862C19.7935 6.94773 20.0009 7.92171 20 8.90664C20.0009 9.89156 19.7935 10.8655 19.3915 11.7646C18.9894 12.6638 18.4017 13.4677 17.667 14.1236C17.561 14.2188 17.4358 14.2902 17.2999 14.333C17.1639 14.3758 17.0204 14.3889 16.879 14.3716L18.485 15.9776C18.6672 16.1662 18.768 16.4188 18.7657 16.681C18.7634 16.9432 18.6582 17.194 18.4728 17.3795C18.2874 17.5649 18.0366 17.67 17.7744 17.6723C17.5122 17.6746 17.2596 17.5738 17.071 17.3916L1.515 1.83664C1.41949 1.74439 1.34331 1.63404 1.2909 1.51204C1.23849 1.39004 1.2109 1.25882 1.20975 1.12604C1.2086 0.993257 1.2339 0.861578 1.28418 0.738681C1.33446 0.615785 1.40871 0.504133 1.5026 0.41024C1.5965 0.316348 1.70815 0.242095 1.83105 0.191814C1.95394 0.141533 2.08562 0.116231 2.2184 0.117385C2.35118 0.118539 2.4824 0.146125 2.6044 0.198534C2.72641 0.250943 2.83675 0.327125 2.929 0.422635L6.275 3.76664L11.261 0.204635C11.4255 0.0872179 11.6192 0.0174024 11.8208 0.0028536C12.0224 -0.0116952 12.2241 0.0295853 12.4038 0.122163C12.5835 0.214741 12.7342 0.355036 12.8394 0.527646C12.9445 0.700257 13.0001 0.898508 13 1.10064Z" fill="currentColor"/>
        </svg>
        {/* Unmute icon (shown when video is muted - clicking will unmute) */}
        <svg ref={unmuteIconRef} className="cursor-unmute" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M13.26 3.29995C13.4165 3.18799 13.5997 3.11905 13.7911 3.1C13.9826 3.08096 14.1758 3.11248 14.3512 3.19143C14.5267 3.27037 14.6785 3.39397 14.7912 3.54988C14.904 3.70579 14.9739 3.88857 14.994 4.07995L15 4.19395V19.8059C15.0001 19.9984 14.9496 20.1875 14.8538 20.3543C14.7579 20.5212 14.6199 20.66 14.4536 20.7568C14.2874 20.8537 14.0986 20.9052 13.9061 20.9063C13.7137 20.9074 13.5244 20.8579 13.357 20.7629L13.261 20.7009L6.68 15.9999H4C3.49542 16.0001 3.00943 15.8095 2.63945 15.4665C2.26947 15.1234 2.04284 14.6531 2.005 14.1499L2 13.9999V9.99995C1.99984 9.49537 2.19041 9.00938 2.5335 8.6394C2.87659 8.26942 3.34684 8.04279 3.85 8.00495L4 7.99995H6.68L13.26 3.29995ZM19.667 6.78295C20.4017 7.4389 20.9894 8.24282 21.3915 9.14193C21.7935 10.041 22.0009 11.015 22 11.9999C22.0009 12.9849 21.7935 13.9588 21.3915 14.858C20.9894 15.7571 20.4017 16.561 19.667 17.2169C19.5694 17.306 19.4551 17.3748 19.3308 17.4194C19.2064 17.464 19.0745 17.4835 18.9426 17.4769C18.8106 17.4702 18.6813 17.4374 18.5621 17.3805C18.4429 17.3236 18.3362 17.2436 18.2481 17.1452C18.1599 17.0467 18.0922 16.9318 18.0487 16.8071C18.0053 16.6823 17.987 16.5502 17.9949 16.4183C18.0028 16.2865 18.0367 16.1575 18.0948 16.0388C18.1528 15.9201 18.2338 15.8141 18.333 15.7269C18.8582 15.2586 19.2782 14.6843 19.5656 14.0419C19.8529 13.3996 20.0009 12.7036 20 11.9999C20 10.5199 19.358 9.18995 18.333 8.27295C18.2338 8.18575 18.1528 8.07975 18.0948 7.96108C18.0367 7.84241 18.0028 7.71341 17.9949 7.58155C17.987 7.44968 18.0053 7.31756 18.0487 7.19281C18.0922 7.06806 18.1599 6.95315 18.2481 6.85473C18.3362 6.75631 18.4429 6.67633 18.5621 6.6194C18.6813 6.56246 18.8106 6.52971 18.9426 6.52304C19.0745 6.51636 19.2064 6.5359 19.3308 6.58051C19.4551 6.62512 19.5694 6.69392 19.667 6.78295ZM17.667 9.01895C18.0866 9.39369 18.4223 9.85289 18.652 10.3665C18.8818 10.88 19.0003 11.4363 19 11.9989C19.0007 12.5619 18.8823 13.1186 18.6525 13.6326C18.4228 14.1465 18.0869 14.606 17.667 14.9809C17.4774 15.1494 17.2308 15.2394 16.9773 15.2329C16.7237 15.2264 16.4821 15.1238 16.3014 14.9459C16.1206 14.7679 16.0143 14.5279 16.0038 14.2745C15.9933 14.0211 16.0796 13.7732 16.245 13.5809L16.333 13.4909C16.743 13.1229 17 12.5919 17 11.9999C17.0012 11.4879 16.8049 10.995 16.452 10.6239L16.333 10.5089C16.2338 10.4217 16.1528 10.3158 16.0948 10.1971C16.0367 10.0784 16.0028 9.94941 15.9949 9.81755C15.987 9.68568 16.0053 9.55356 16.0487 9.42881C16.0922 9.30406 16.1599 9.18915 16.2481 9.09073C16.3362 8.99231 16.4429 8.91233 16.5621 8.8554C16.6813 8.79846 16.8106 8.76571 16.9426 8.75904C17.0745 8.75237 17.2064 8.7719 17.3308 8.81651C17.4551 8.86112 17.5694 8.92992 17.667 9.01895Z" fill="currentColor"/>
        </svg>
        {/* Me icon - person with "Me!" text in head */}
        <svg ref={meIconRef} className="cursor-me" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="12" r="10" fill="currentColor"/>
          <text className="cursor-me-label" x="20" y="15" textAnchor="middle" fontSize="8" fontFamily="Manrope, sans-serif" fontWeight="600">Me!</text>
          <path d="M20 24C10 24 4 32 4 38C4 39.1 4.9 40 6 40H34C35.1 40 36 39.1 36 38C36 32 30 24 20 24Z" fill="currentColor"/>
        </svg>
      </S.CursorWrapper>
    </>
  );
}
