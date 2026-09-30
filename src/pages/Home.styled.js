import styled, { css, keyframes } from 'styled-components';

const fadeInFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 10px 0;
  height: 100vh;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  box-sizing: border-box;
  overflow: hidden;
  opacity: ${({ $contentReady }) => ($contentReady ? 1 : 0)};
  transition: ${({ $contentReady }) => ($contentReady ? 'opacity 0.3s ease-out' : 'none')};
`;

export const ReelWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
  flex: 1;
  justify-content: center;
  overflow: hidden;
  min-height: 0;
  padding: 0;

  /* The gallery button rises out of here to sit level with the title. */
  ${({ $galleryOpen }) => $galleryOpen && css`
    overflow: visible;
  `}

  ${({ theme }) => theme.media.sm} {
    gap: ${({ theme }) => theme.spacing(1)};
  }
`;

export const SelectedWorksLabel = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  padding: 0 200px;
  box-sizing: border-box;
  margin-bottom: 15px;
  z-index: 2000;

  ${({ theme }) => theme.media.lg} {
    padding: 0 80px;
  }

  ${({ theme }) => theme.media.sm} {
    display: none;
  }
`;

/**
 * The gallery toggle: "* view all" on the reel, "close" once the gallery is up.
 * Hovering it sweeps the chip orange, and the custom cursor turns into the same
 * chip reading what the click will do (see the `chip` variant in
 * CustomCursor.styled.js).
 */
export const SelectedWorksText = styled.button`
  position: relative;
  overflow: hidden;
  /* Both labels share one cell, so the chip never resizes as it changes. */
  display: inline-grid;
  align-items: center;
  justify-items: center;
  appearance: none;
  border: none;
  font: inherit;
  text-align: left;
  background-color: ${({ theme }) => theme.colors.text};
  padding: 4px 10px;
  transform: translateY(${({ $lift }) => -($lift ?? 0)}px);
  transition: transform 0.5s cubic-bezier(0.77, 0, 0.175, 1);

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-color: ${({ theme }) => theme.colors.background};
    transform: translateX(0%);
    z-index: 3;
    pointer-events: none;
    transition: transform ${({ theme }) => theme.transitions.reveal};
    ${({ $isVisible }) => $isVisible && css`
      transform: translateX(101%);
    `}
  }

`;

/** Holds the widest label so the chip's width never moves. */
export const SelectedWorksSizer = styled.span`
  grid-area: 1 / 1;
  visibility: hidden;
  pointer-events: none;
  white-space: nowrap;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
`;

export const SelectedWorksInner = styled.span`
  grid-area: 1 / 1;
  position: relative;
  white-space: nowrap;
  z-index: 1;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
  color: ${({ theme }) => theme.colors.background};
`;

/**
 * The orange half of the label. It wipes across from the right, covering the
 * resting label and uncovering what the click will do in the same movement —
 * the inner text counter-slides so it is revealed in place rather than dragged
 * in.
 */
export const SelectedWorksCover = styled.span`
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow: hidden;
  display: flex;
  align-items: center;
  pointer-events: none;
  background-color: ${({ theme }) => theme.colors.accent};
  transform: translateX(101%);
  transition: transform ${({ theme }) => theme.transitions.revealFast};

  ${SelectedWorksText}:hover & {
    transform: translateX(0%);
  }
`;

export const SelectedWorksCoverInner = styled.span`
  width: 100%;
  text-align: center;
  white-space: nowrap;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
  color: ${({ theme }) => theme.colors.background};
  transform: translateX(-101%);
  transition: transform ${({ theme }) => theme.transitions.revealFast};

  ${SelectedWorksText}:hover & {
    transform: translateX(0%);
  }
`;

/**
 * What the orange half shows once the gallery is open: a small cross, rather
 * than a second label. Two bars crossed at the middle of the chip.
 */
export const SelectedWorksClose = styled.span`
  position: absolute;
  inset: 0;
  display: block;

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 9px;
    height: 1.5px;
    background-color: ${({ theme }) => theme.colors.background};
  }

  &::before {
    transform: translate(-50%, -50%) rotate(45deg);
  }

  &::after {
    transform: translate(-50%, -50%) rotate(-45deg);
  }
`;

export const GalleryInstruction = styled.div`
  display: none;

  ${({ theme }) => theme.media.sm} {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 6px 20px;
    box-sizing: border-box;
    opacity: 0;
    transform: translateX(30px);

    ${({ $isVisible }) => $isVisible && css`
      animation: ${fadeInFromRight} 0.8s ease-out forwards;
    `}
  }

  ${({ theme }) => theme.media.xs} {
    padding: 4px 16px;
  }
`;

export const InstructionText = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.white};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};

  ${({ theme }) => theme.media.xs} {
    font-size: 8px;
  }
`;

/**
 * Wraps the title. It stays put in gallery view — the title itself swaps what it
 * reads (see Title.jsx), so the slot never moves.
 */
export const TitleLayer = styled.div`
  width: 100%;
`;

/** Wraps the reel so it can fade out of the way when the gallery takes over. */
export const ReelLayer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
  visibility: ${({ $hidden }) => ($hidden ? 'hidden' : 'visible')};
  pointer-events: ${({ $hidden }) => ($hidden ? 'none' : 'auto')};
  transition:
    opacity 0.4s ease-out,
    visibility 0s linear ${({ $hidden }) => ($hidden ? '0.4s' : '0s')};
`;

/** Wraps the scroll block so the gallery's thumbnail strip can take its place. */
export const ScrollReelLayer = styled.div`
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
  visibility: ${({ $hidden }) => ($hidden ? 'hidden' : 'visible')};
  pointer-events: ${({ $hidden }) => ($hidden ? 'none' : 'auto')};
  transition:
    opacity 0.4s ease-out,
    visibility 0s linear ${({ $hidden }) => ($hidden ? '0.4s' : '0s')};
`;
