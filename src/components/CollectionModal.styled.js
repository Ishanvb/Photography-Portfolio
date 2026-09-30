import styled, { css } from 'styled-components';

/**
 * The collection pop-up.
 *
 * A tall panel in the middle of a blurred screen, holding one project's photos
 * stacked down the page. They all share one width, so the column has a single
 * left and right edge the whole way down and each photo stands as tall as its
 * own shape needs. Every photo is separated from the next by a row carrying the
 * caption for the photo above it on the left and its number on the right; the
 * row above the first photo carries the collection's name and its date instead.
 *
 * The sizing is pure CSS: the panel publishes the width available as a custom
 * property and each photo's own aspect ratio comes in as `--ar`, so a photo's
 * box is the right shape before its file has loaded and the scroll position
 * never shifts under the reader.
 */
export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.scrim};
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  opacity: ${({ $shown }) => ($shown ? 1 : 0)};
  transition: opacity 0.3s ease-out;
`;

export const Panel = styled.div`
  --pad: 26px;
  --row: 46px;
  --panel-w: min(1180px, 78vw);
  /* What is left for a photo once the panel's own gaps are taken out. Every
     photo takes all of it, so they share one width down the whole column. */
  --shot-w: calc(var(--panel-w) - var(--pad) * 2);

  position: relative;
  width: var(--panel-w);
  height: 92vh;
  border-radius: 2px;
  overflow: hidden;
  /* The panel wears the page's opposite theme (see CollectionModal.jsx), and
     lets a little of the page through: its off-white on the dark page a touch
     more than its near-black on the light page. */
  background-color: ${({ theme }) =>
    `color-mix(in srgb, ${theme.colors.background} ${theme.colorScheme === 'light' ? 80 : 90}%, transparent)`};
  transform: ${({ $shown }) => ($shown ? 'scale(1)' : 'scale(0.985)')};
  opacity: ${({ $shown }) => ($shown ? 1 : 0)};
  transition:
    transform 0.34s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.26s ease-out;

  ${({ theme }) => theme.media.sm} {
    --pad: 14px;
    --row: 38px;
    --panel-w: 92vw;
  }
`;

/** The scrolling document inside the panel. */
export const Scroll = styled.div`
  /* The offset parent for the photo blocks, so scrolling to one is a plain
     read of its offsetTop. */
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 var(--pad);
  box-sizing: border-box;
  overscroll-behavior: contain;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  /* It only holds focus so the arrow keys reach it; it is not a control. */
  &:focus {
    outline: none;
  }
`;

/**
 * One photo and the row beneath it. Every block is the same width, so the
 * column has one left edge and one right edge the whole way down and the
 * captions and numbers line up with the photos and with each other.
 */
export const Block = styled.div`
  width: var(--shot-w);
  margin: 0 auto;
`;

/**
 * The gap between two photos. Same height as the gap at the top and bottom of
 * the panel, so the photo plus the rows either side of it is exactly one
 * screenful and the stack reads as a run of pages.
 */
export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  height: var(--row);
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  /* The tracking the titles use, so a row reads as part of the same family. */
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};

  ${({ theme }) => theme.media.sm} {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    gap: 12px;
  }
`;

/**
 * Shared by every piece of text in a row: the box hugs the glyphs rather than
 * the line, so the plain text on the left stands exactly as tall as the
 * highlighted block on the right.
 */
const rowBox = css`
  line-height: 1.15;
  padding: 3px 0 4px;
`;

/** The inverted block the collection name and the photo numbers sit in. */
const highlighted = css`
  ${rowBox}
  padding-left: 7px;
  padding-right: 7px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  color: ${({ theme }) => theme.colors.background};
  background-color: ${({ theme }) => theme.colors.text};
`;

/** Caption for the photo above, flush with its left edge. */
export const Caption = styled.span`
  ${rowBox}
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

/** "collection <name>", set the way the home title is in gallery view. */
export const Label = styled.span`
  display: flex;
  align-items: center;
  gap: 4px; /* a little air between "collection" and the highlighted name */
  flex-shrink: 0;
`;

export const LabelWord = styled.span`
  ${rowBox}
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

// Set the way the home title is in gallery view, but with a sliver of padding
// so the block sits just clear of the name's letters. Label's gap sets it off
// from "collection".
export const LabelValue = styled.span`
  ${highlighted}
  padding-left: 3px;
  padding-right: 3px;
`;

/** The photo's number, flush with the photo's right edge. */
export const Number = styled.span`
  ${highlighted}
  flex-shrink: 0;
`;

/** The collection's date, top right. Bold, and "present" until one is set. */
export const DateText = styled.span`
  ${rowBox}
  flex-shrink: 0;
  text-transform: uppercase;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

/**
 * One photo. The width is fixed by the block, so a photo's own aspect ratio
 * decides how tall it stands — a portrait shot simply runs longer than a
 * landscape one. The ratio is known before the file arrives, so the scroll
 * position never shifts under the reader.
 */
export const Shot = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: var(--ar);
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.textFaint};
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

export const Video = styled.iframe`
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
`;
