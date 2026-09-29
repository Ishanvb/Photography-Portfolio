import styled from 'styled-components';
import { dockBottom } from './ScrollReel.styled';

/**
 * Gallery view stage.
 *
 * Two pieces: the photo in the middle of the screen, and the strip of square
 * thumbnails standing where the home reel's scroll block does. Both are laid
 * out imperatively from a rAF loop in GalleryView.jsx — transforms and opacity
 * only — so these styles just describe the resting look.
 */
export const Stage = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  z-index: 5;
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  /* The stage spans the window for layout only — the header and the toggle sit
     above it and have to stay clickable, so input lands on the surface. */
  pointer-events: none;
  transition: opacity 0.45s ease-out;
`;

/** Catches drags and wheels anywhere on the stage. */
export const Surface = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: ${({ $active }) => ($active ? 'auto' : 'none')};
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

/**
 * The band the centre photo lives in: everything between the title at the top
 * and the strip at the bottom. Its top and bottom are written from measure().
 */
export const CentreBand = styled.div`
  position: absolute;
  left: 6vw;
  right: 6vw;
  top: 0;
  bottom: 0;
  z-index: 2;
  pointer-events: none;
`;

/** One photo's box — cut to its own shape, as large as the band allows. */
export const Frame = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  transform-origin: 50% 50%;
  opacity: 0;
  background-color: ${({ theme }) => theme.colors.textFaint};
  will-change: transform, opacity;
  backface-visibility: hidden;

  & > picture {
    display: block;
    width: 100%;
    height: 100%;
  }
`;

export const Photo = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.45s ease-out;
  -webkit-user-drag: none;

  &[data-loaded='true'] {
    opacity: 1;
  }
`;

/**
 * The belt: the full width of the screen, standing at the height the home
 * reel's scroll block does, with squares the height of that block's lines. Its
 * height and every square's size are written from measure().
 */
export const Belt = styled.div`
  position: absolute;
  ${dockBottom}
  left: 0;
  right: 0;
  z-index: 10;
  overflow: hidden;
  touch-action: none;
  pointer-events: ${({ $active }) => ($active ? 'auto' : 'none')};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.18s ease-out;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  /* Squares are clipped at both edges, so soften the cut. */
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 5%, #000 95%, transparent 100%);
  mask-image: linear-gradient(to right, transparent 0, #000 5%, #000 95%, transparent 100%);
`;

export const Square = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.textSubtle};
  opacity: 0;
  will-change: transform, opacity;
  backface-visibility: hidden;

  & > picture {
    display: block;
    width: 100%;
    height: 100%;
  }
`;

export const Thumb = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.2s ease-out;
  -webkit-user-drag: none;

  &[data-loaded='true'] {
    opacity: 1;
  }
`;

/**
 * The fixed frame at the middle of the screen. It never moves — the belt runs
 * under it — so whichever photo is up is always the one in the centre of the
 * strip. Sized to one pitch, so it meets the squares either side without
 * overlapping them.
 */
export const Marker = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  box-sizing: border-box;
  border: 1px solid ${({ theme }) => theme.colors.text};
  pointer-events: none;
  z-index: 3;
`;
