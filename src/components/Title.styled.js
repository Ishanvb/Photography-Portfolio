import styled, { css } from 'styled-components';
import { blink } from '~/styles/animations';

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 0 ${({ theme }) => theme.spacing(23.125)};
  position: relative;
  box-sizing: border-box;
  height: 72px;

  ${({ theme }) => theme.media.sm} {
    padding: 0 ${({ theme }) => theme.spacing(5)};
    height: 50px;
  }

  ${({ theme }) => theme.media.xs} {
    padding: 0 ${({ theme }) => theme.spacing(2.5)};
    height: 40px;
  }
`;

/**
 * The title, as a run of letter cells.
 *
 * Every letter owns a cell the width of the letter that belongs there, so a
 * letter can be swapped for a random one mid-change without the line shuffling
 * around underneath. In gallery view the run is "collection" followed by the
 * collection's name, which sits on a highlight that wipes in from the left.
 */
export const Line = styled.h1`
  position: relative;
  display: inline-flex;
  align-items: baseline;
  margin: 0;
  padding: 0;
  height: 72px;
  line-height: 1.2;
  white-space: nowrap;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: ${({ theme }) => theme.typography.fontSize['6xl']};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tighter};
  color: ${({ theme }) => theme.colors.text};

  ${({ $isTyping }) => $isTyping && css`
    &::after {
      content: '|';
      margin-left: 2px;
      animation: ${blink} 0.75s step-end infinite;
    }
  `}

  ${({ theme }) => theme.media.sm} {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    letter-spacing: -3px;
    height: 50px;
  }

  ${({ theme }) => theme.media.xs} {
    font-size: 28px;
    letter-spacing: -2px;
    height: 40px;
  }
`;

/**
 * The part that is not the collection name. It draws above the highlight: the
 * title's tracking is tight enough that the block can tuck a little way under
 * the last letter, and the letter should stay white where it does.
 */
export const Plain = styled.span`
  position: relative;
  z-index: 2;
`;

/**
 * One letter's space. The hidden copy of the letter that belongs here sets the
 * width, and whatever is showing right now is laid over it — so a random letter
 * mid-change never moves its neighbours, and the box drawn around a cell is
 * flush with the space that letter occupies.
 */
export const Cell = styled.span`
  position: relative;
  display: inline-block;

  ${({ $boxed }) => $boxed && css`
    &::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 0.13em;
      bottom: 0.17em;
      border: 1px solid currentColor;
      pointer-events: none;
    }
  `}
`;

export const CellSizer = styled.span`
  visibility: hidden;
`;

export const CellGlyph = styled.span`
  position: absolute;
  left: 0;
  top: 0;
`;

/**
 * The collection's name. Two copies of the same letters sit on top of each
 * other — white underneath, black on the highlight above — and the top one is
 * clipped in from the left, so the highlight and the ink arrive together.
 */
export const Name = styled.span`
  position: relative;
  display: inline-block;
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};

  /* A cell is as wide as its letter's advance plus the line's tracking, and
     that tracking is negative — so the last letter's ink would hang off the end
     of the highlight. Taking the tracking off that one cell lands the block on
     the letter's own edge, the same way it starts on one. */
  ${Cell}:last-child > ${CellSizer} {
    letter-spacing: normal;
  }
`;

export const NameBase = styled.span`
  display: block;
`;

export const NameCover = styled.span`
  position: absolute;
  inset: 0;
  display: block;
  color: ${({ theme }) => theme.colors.background};
  /* The reveal the contact page uses, run the other way: coming into place. */
  clip-path: inset(0 100% 0 0);
  transition: clip-path 0.8s cubic-bezier(0.77, 0, 0.175, 1);

  ${({ $in }) => $in && css`
    clip-path: inset(0 0 0 0);
  `}

  /* The highlight itself, hugging the letters rather than the whole line. */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0.13em;
    bottom: 0.17em;
    background-color: ${({ theme }) => theme.colors.text};
  }
`;

export const NameInk = styled.span`
  position: relative;
  z-index: 1;
  display: block;
`;
