import styled, { createGlobalStyle } from 'styled-components';

// Global style to hide default cursor on hover-capable devices
export const HideCursorGlobal = createGlobalStyle`
  ${({ theme }) => theme.media.hoverFine} {
    * {
      cursor: none !important;
    }
  }
`;

export const CursorWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: ${({ theme }) => theme.zIndex.cursor};
  pointer-events: none;

  width: 12px;
  height: 12px;
  border-radius: 30px;
  background: ${({ theme }) => theme.colors.cursorBg};

  display: flex;
  align-items: center;
  justify-content: center;

  transform: translate(-50%, -50%);
  transition:
    width ${({ theme }) => theme.transitions.spring},
    height ${({ theme }) => theme.transitions.spring},
    padding ${({ theme }) => theme.transitions.spring},
    opacity ${({ theme }) => theme.transitions.fast},
    background ${({ theme }) => theme.transitions.normal};

  &.hidden {
    opacity: 0;
  }

  /* Text label inside cursor */
  & span {
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wider};
    white-space: nowrap;
    color: ${({ theme }) => theme.colors.background};
    opacity: 0;
    transform: scale(0.8);
    transition: opacity ${({ theme }) => theme.transitions.normal},
                transform ${({ theme }) => theme.transitions.normal};
  }

  &.active {
    width: auto;
    height: auto;
    padding: 10px 20px;
    background: ${({ theme }) => theme.colors.backgroundOverlay};
  }

  &.active span {
    opacity: 1;
    transform: scale(1);
  }

  /* Arrow icon inside cursor for magnetic state */
  & .cursor-arrow {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid ${({ theme }) => theme.colors.background};
    opacity: 0;
    transform: scale(0);
    transition: opacity ${({ theme }) => theme.transitions.normal},
                transform ${({ theme }) => theme.transitions.normal};
    position: absolute;
  }

  & .cursor-arrow.flipped {
    transform: scale(1) rotate(180deg);
  }

  /* Magnetic cursor state */
  &.magnetic {
    width: 48px;
    height: 48px;
    padding: 0;
    background: ${({ theme }) => theme.colors.backgroundOverlay};
  }

  &.magnetic .cursor-arrow {
    opacity: 1;
    transform: scale(1);
  }

  &.magnetic .cursor-arrow.flipped {
    transform: scale(1) rotate(180deg);
  }

  /* Video cursor state */
  &.video-cursor {
    width: 64px;
    height: 64px;
    padding: 0;
    background: ${({ theme }) => theme.colors.backgroundOverlay};
  }

  /* Play icon (triangle pointing right) */
  & .cursor-play {
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 16px solid ${({ theme }) => theme.colors.background};
    opacity: 0;
    transform: scale(0);
    transition: opacity ${({ theme }) => theme.transitions.normal},
                transform ${({ theme }) => theme.transitions.normal};
    position: absolute;
    margin-left: 3px;
  }

  & .cursor-play.visible {
    opacity: 1;
    transform: scale(1);
  }

  /* Pause icon (two vertical bars) */
  & .cursor-pause {
    display: flex;
    gap: 6px;
    opacity: 0;
    transform: scale(0);
    transition: opacity ${({ theme }) => theme.transitions.normal},
                transform ${({ theme }) => theme.transitions.normal};
    position: absolute;
  }

  & .cursor-pause::before,
  & .cursor-pause::after {
    content: '';
    width: 6px;
    height: 20px;
    background: ${({ theme }) => theme.colors.background};
    border-radius: 2px;
  }

  & .cursor-pause.visible {
    opacity: 1;
    transform: scale(1);
  }

  /* Mute cursor state */
  &.mute-cursor {
    width: 48px;
    height: 48px;
    padding: 0;
    background: ${({ theme }) => theme.colors.backgroundOverlay};
  }

  /* SVG mute/unmute icons */
  & .cursor-mute,
  & .cursor-unmute {
    position: absolute;
    opacity: 0;
    transform: scale(0);
    transition: opacity ${({ theme }) => theme.transitions.normal},
                transform ${({ theme }) => theme.transitions.normal};
  }

  & .cursor-mute.visible,
  & .cursor-unmute.visible {
    opacity: 1;
    transform: scale(1);
  }

  /* Progress bar cursor state */
  &.progress-cursor {
    width: 14px;
    height: 14px;
    padding: 0;
    background: ${({ theme }) => theme.colors.text};
  }

  &.progress-cursor.dragging {
    width: 18px;
    height: 18px;
    background: ${({ theme }) => theme.colors.cursorBg};
  }

  /* Me cursor state */
  &.me-cursor {
    width: 64px;
    height: 64px;
    padding: 0;
    background: ${({ theme }) => theme.colors.backgroundOverlay};
  }

  & .cursor-me {
    position: absolute;
    opacity: 0;
    transform: scale(0);
    transition: opacity ${({ theme }) => theme.transitions.normal},
                transform ${({ theme }) => theme.transitions.normal};
  }

  & .cursor-me.visible {
    opacity: 1;
    transform: scale(1);
  }

  /* Header cursor state - inflated circle */
  &.header-cursor {
    width: 32px;
    height: 32px;
    padding: 0;
  }

  /* YouTube cursor state - slightly bigger circle */
  &.youtube-cursor {
    width: 20px;
    height: 20px;
    padding: 0;
  }

  /* Icon container for cursor icons (left of text) */
  & .cursor-icon-container {
    display: none;
    margin-right: ${({ theme }) => theme.spacing(1)};
  }

  & .cursor-icon-container.visible {
    display: flex;
    align-items: center;
  }

  & .cursor-icon {
    display: none;
    width: 18px;
    height: 18px;
  }

  & .cursor-icon.visible {
    display: block;
  }
`;
