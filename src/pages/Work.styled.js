import styled, { css } from 'styled-components';
import { fadeInFromLeft, fadeInFromTop, blink } from '~/styles/animations';

export const Page = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 10px 0;
  /* Nothing below the contact stage: it is the last thing on the page and ends
     with the block centred, so any padding here would let it scroll off. */
  padding-bottom: 0;
  box-sizing: border-box;
  /* clip, not hidden: hidden on one axis computes the other to auto, which
     makes this a scroll container and stops the contact stage inside it from
     sticking to the viewport. About's container does the same. */
  overflow-x: clip;
`;

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  padding: 0 ${({ theme }) => theme.spacing(5)};
  margin-top: ${({ theme }) => theme.spacing(2.5)};
  margin-bottom: ${({ theme }) => theme.spacing(11)};
  box-sizing: border-box;

  ${({ theme }) => theme.media.sm} {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    padding: 0 ${({ theme }) => theme.spacing(3)};
    margin-top: 10px;
    margin-bottom: ${({ theme }) => theme.spacing(5)};
  }

  ${({ theme }) => theme.media.xs} {
    padding: 0 ${({ theme }) => theme.spacing(2)};
    margin-bottom: 30px;
  }
`;

export const TitleFrame = styled.div`
  flex-shrink: 0;

  ${({ theme }) => theme.media.sm} {
    text-align: right;
  }
`;

export const CategoryText = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-style: normal;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: normal;
  letter-spacing: -1.5px;
  margin: 0;

  ${({ theme }) => theme.media.sm} {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    letter-spacing: -0.5px;
  }

  ${({ theme }) => theme.media.xs} {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    letter-spacing: -0.3px;
  }
`;

/** Letters roll down one after another as a dropdown row is hovered. */
export const LetterStack = styled.span`
  display: block;
  height: 200%;
  transform: translateY(-50%);
  transition: transform ${({ theme }) => theme.transitions.smooth};

  & span {
    display: block;
    height: 50%;
  }
`;

export const AnimatedCategory = styled.span`
  display: inline-flex;
`;

export const Letter = styled.span`
  position: relative;
  overflow: hidden;
  height: 32px;
  display: inline-block;

  ${({ theme }) => theme.media.sm} {
    height: 18px;
  }

  ${({ theme }) => theme.media.xs} {
    height: 16px;
  }
`;

/** Sits under the title when closed and under the whole list when open. */
export const CategoryLine = styled.div``;

export const DropdownItems = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease;
  order: 1;
`;

export const DropdownItem = styled.button`
  display: flex;
  padding: 10px;
  align-items: center;
  gap: 10px;
  align-self: stretch;
  border: none;
  border-bottom: 2px solid ${({ theme }) => theme.colors.text};
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  opacity: 0;
  transform: translateY(-10px);
  transition:
    opacity ${({ theme }) => theme.transitions.normal},
    transform ${({ theme }) => theme.transitions.normal};

  &:hover ${LetterStack} {
    transform: translateY(0%);
  }

  ${({ theme }) => theme.media.touch} {
    padding: 14px 10px;
    min-height: 44px;

    &:active {
      opacity: 0.7;
    }

    &:active ${LetterStack} {
      transform: translateY(0%);
    }
  }
`;

export const CategoryArrow = styled.button`
  width: 0;
  height: 0;
  padding: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 12px solid ${({ theme }) => theme.colors.text};
  border-bottom: none;
  background: none;
  cursor: pointer;
  transition:
    transform ${({ theme }) => theme.transitions.normal},
    border-top-color ${({ theme }) => theme.transitions.fast};
  flex-shrink: 0;

  ${({ $isOpen }) => $isOpen && css`
    transform: rotate(180deg);
  `}

  &.cursor-nearby {
    border-top-color: transparent;
  }

  ${({ theme }) => theme.media.sm} {
    border-left-width: 5px;
    border-right-width: 5px;
    border-top-width: 5px;
  }

  ${({ theme }) => theme.media.xs} {
    border-left-width: 4px;
    border-right-width: 4px;
    border-top-width: 4px;
  }
`;

export const CategoryDropdown = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 320px;
  opacity: 0;

  ${({ $isVisible }) => $isVisible && css`
    animation: ${fadeInFromLeft} 0.8s ease-out forwards;
  `}

  ${({ $isOpen }) => $isOpen && css`
    & ${CategoryLine} {
      order: 2;
    }

    & ${DropdownItems} {
      max-height: 600px;
    }

    & ${DropdownItem} {
      opacity: 1;
      transform: translateY(0);
    }

    & ${DropdownItem}:nth-child(1) { transition-delay: 0.05s; }
    & ${DropdownItem}:nth-child(2) { transition-delay: 0.1s; }
    & ${DropdownItem}:nth-child(3) { transition-delay: 0.15s; }
    & ${DropdownItem}:nth-child(4) { transition-delay: 0.2s; }
    & ${DropdownItem}:nth-child(5) { transition-delay: 0.25s; }
    & ${DropdownItem}:nth-child(6) { transition-delay: 0.3s; }
  `}

  ${({ theme }) => theme.media.sm} {
    max-width: 200px;
  }

  ${({ theme }) => theme.media.xs} {
    max-width: 140px;
  }
`;

export const CategoryItem = styled.div`
  display: flex;
  padding: 0;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(5)};
  align-self: stretch;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  order: 0;
  margin-bottom: 10px;

  & ${CategoryText} {
    font-size: ${({ theme }) => theme.typography.fontSize['7xl']};
    letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
    line-height: ${({ theme }) => theme.typography.lineHeight.none};
    margin: 0;
  }

  ${({ theme }) => theme.media.sm} {
    gap: ${({ theme }) => theme.spacing(2)};
    cursor: pointer;

    & ${CategoryText} {
      font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    }
  }

  ${({ theme }) => theme.media.xs} {
    gap: 10px;

    & ${CategoryText} {
      font-size: 28px;
    }
  }
`;

export const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: ${({ theme }) => theme.typography.fontSize['7xl']};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  color: ${({ theme }) => theme.colors.text};
  text-align: right;
  margin: 0;
  line-height: ${({ theme }) => theme.typography.lineHeight.none};
  min-height: 69px;

  ${({ theme }) => theme.media.sm} {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    min-height: 36px;
  }

  ${({ theme }) => theme.media.xs} {
    font-size: 28px;
    min-height: 28px;
  }
`;

export const Cursor = styled.span`
  animation: ${blink} 1s infinite;
  margin-left: 2px;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(11)};
  width: 100%;
  padding-top: ${({ theme }) => theme.spacing(2.5)};
  padding-left: ${({ theme }) => theme.spacing(5)};
  padding-right: ${({ theme }) => theme.spacing(5)};
  box-sizing: border-box;

  ${({ theme }) => theme.media.sm} {
    padding-left: ${({ theme }) => theme.spacing(3)};
    padding-right: ${({ theme }) => theme.spacing(3)};
    gap: ${({ theme }) => theme.spacing(5)};
  }

  ${({ theme }) => theme.media.xs} {
    padding-left: ${({ theme }) => theme.spacing(2)};
    padding-right: ${({ theme }) => theme.spacing(2)};
    gap: 30px;
  }
`;

/* ========== Photo Grid ==========
   Four equal columns (two on a tablet, one on a phone), each its own stack —
   no rows, so a portrait photo just runs taller and the spot below it starts
   one gap further down. Work.jsx deals the spots into the columns. Horizontal
   and vertical spacing are the same value, so the grid breathes evenly.
*/

const gridGap = css`
  gap: ${({ theme }) => theme.spacing(5)};

  ${({ theme }) => theme.media.sm} {
    gap: ${({ theme }) => theme.spacing(3)};
  }

  ${({ theme }) => theme.media.xs} {
    gap: ${({ theme }) => theme.spacing(2)};
  }
`;

// The thin, faint rule over the grid.
const faintLine = ({ theme }) =>
  `1px solid color-mix(in srgb, ${theme.colors.text} 15%, transparent)`;

export const GalleryGrid = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
  border-top: ${faintLine};
  padding-top: ${({ theme }) => theme.spacing(5)};
  ${gridGap}

  ${({ theme }) => theme.media.sm} {
    padding-top: ${({ theme }) => theme.spacing(3)};
  }

  ${({ theme }) => theme.media.xs} {
    padding-top: ${({ theme }) => theme.spacing(2)};
  }
`;

export const GalleryColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-width: 0;
  ${gridGap}
`;

// A blank spot has no photo to size it, so it takes the shape of a horizontal
// one: full column width, and the height that follows from it.
const spot = css`
  width: 100%;
  box-sizing: border-box;
  aspect-ratio: 3 / 2;
  opacity: 0;
  animation: ${fadeInFromTop} 0.8s ease-out forwards;
  animation-delay: ${({ $index }) => `${Math.min($index || 0, 12) * 0.06}s`};
`;

// How far the frame stands off the photo — the ring that fills in.
const FRAME_GAP = 10;

// The slightly rounded corners of the photo and its frame.
const PHOTO_RADIUS = '2px';

// Film grain, as an SVG noise tile: a mask that eats into the stamp's edge,
// so the edge prints unevenly.
const noise = (alpha) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 ${alpha}'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/**
 * The black the photo holds its place with until the file lands. Its own
 * element rather than the frame's background, so it sits above the stamp card
 * behind the photo instead of under it.
 */
export const Backing = styled.span`
  position: absolute;
  inset: 0;
  border-radius: ${PHOTO_RADIUS};
  background-color: ${({ theme }) => theme.colors.black};
`;

/**
 * A soft, low glow of the frame's light bleeding out behind it, like ink
 * leaking into paper. Laid down at the frame's angle, a little below it.
 *
 * Drawn as a shadow rather than a blurred block: a blur filter on every tile
 * is its own offscreen pass, and the page ran noticeably heavier for it.
 */
const leak = ({ theme }) =>
  `0 6px 28px 0 color-mix(in srgb, ${theme.colors.text} 10%, transparent)`;

export const InkLeak = styled.span`
  position: absolute;
  inset: -5px;
  border-radius: ${PHOTO_RADIUS};
  z-index: -2;
  box-shadow: ${leak};
  transform: var(--lie);
  pointer-events: none;
`;

/**
 * The same soft leak for the photo itself: straight, like the photo, and cast
 * onto the frame beneath it rather than behind it.
 */
export const PhotoLeak = styled(InkLeak)`
  inset: 0;
  z-index: -1;
  transform: none;
`;

/**
 * The stamp's frame: a solid light card behind the photo, standing just proud
 * of it, laid down at its own slight angle (`--lie`, set inline from Work.jsx)
 * so it peeks out unevenly while the photo stays straight. A little grain is
 * eaten out of it so it reads as ink rather than a flat fill.
 */
export const StampEdge = styled.span`
  position: absolute;
  inset: -5px;
  border-radius: ${PHOTO_RADIUS};
  z-index: -1;
  background-color: color-mix(in srgb, ${({ theme }) => theme.colors.text} 80%, transparent);
  transform: var(--lie);
  pointer-events: none;
  -webkit-mask-image: ${noise('0.35 0.8')};
  mask-image: ${noise('0.35 0.8')};
`;

export const PhotoSpot = styled.figure`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin: 0;
  opacity: 0;
  animation: ${fadeInFromTop} 0.8s ease-out forwards;
  animation-delay: ${({ $index }) => `${Math.min($index || 0, 12) * 0.06}s`};
`;

/**
 * Rendered as a button — clicking a photo opens its collection.
 *
 * The photo is also its own cursor: hovering swallows the real one (see the
 * `merge` variant in CustomCursor.styled.js) and a thin border settles around
 * the photo in its place, with the ring between the two filling in behind it —
 * quicker than the border arrives, so the frame reads as closing onto the shot.
 */
export const PhotoFrame = styled.div`
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  appearance: none;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;

  /* Until the file lands the photo has no shape of its own, so it holds a black
     square in its place and fades in over it once it arrives.

     The square is reserved on the image rather than on this box: a lazily
     loaded image with no height covers no area, never counts as reaching the
     viewport, and so never loads — which would leave it without a height for
     good. Giving it the square up front breaks that circle. */
  background-color: ${({ theme }) => theme.colors.black};

  & img {
    display: block;
    width: 100%;
    height: auto;
    position: relative;
  }

  /* The photo's real shape is set inline from Work.jsx, so its box is already
     the right size before the file lands. */
  & img {
    border-radius: ${PHOTO_RADIUS};
    opacity: 0;
    transition: opacity 0.5s ease-out;
  }

  & img[data-loaded='true'] {
    opacity: 1;
  }

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: -${FRAME_GAP}px;
    opacity: 0;
    pointer-events: none;
  }

  /* The ring around the photo. Behind the shot, so only the margin shows. */
  &::before {
    z-index: -1;
    background-color: ${({ theme }) => theme.colors.text};
    transform: scale(0.99);
    transition:
      opacity 0.12s ease-out,
      transform 0.12s ease-out;
  }

  /* The border the cursor becomes. */
  &::after {
    border: 1px solid ${({ theme }) => theme.colors.text};
    transform: scale(0.97);
    transition:
      opacity 0.28s ease-out,
      transform 0.34s cubic-bezier(0.16, 1, 0.3, 1);
  }

  &:hover::before,
  &:hover::after,
  &:focus-visible::before,
  &:focus-visible::after {
    opacity: 1;
    transform: scale(1);
  }

  &:focus-visible {
    outline: none;
  }

  /* Its own stacking context, so the stamp frame can sit behind the photo
     without dropping behind the page. */
  isolation: isolate;

  ${({ theme }) => theme.media.touch} {
    &::before,
    &::after {
      display: none;
    }
  }
`;

export const EmptySpot = styled.div`
  ${spot}
  position: relative;
  background-color: ${({ theme }) => theme.colors.background};
`;

/**
 * A cluster of dots in the middle of a blank spot. The box is the size of the
 * lone circle, and every arrangement lives inside it — so one circle and seven
 * take up exactly the same area, the seven sitting within the round the one
 * would have filled.
 */
export const Circles = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  width: 52px;
  height: 52px;
  transform: translate(-50%, -50%);
  pointer-events: none;

  /* A faint disc round the cluster — big enough to hold the lone circle too. */
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 180%;
    height: 180%;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.text};
    opacity: 0.05;
    transform: translate(-50%, -50%);
  }

  ${({ theme }) => theme.media.sm} {
    width: 36px;
    height: 36px;
  }
`;

export const Circle = styled.span`
  position: absolute;
  width: ${({ $solo }) => ($solo ? '100%' : '10px')};
  height: ${({ $solo }) => ($solo ? '100%' : '10px')};
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.text};
  transform: translate(-50%, -50%);

  ${({ theme }) => theme.media.sm} {
    width: ${({ $solo }) => ($solo ? '100%' : '7px')};
    height: ${({ $solo }) => ($solo ? '100%' : '7px')};
  }
`;
