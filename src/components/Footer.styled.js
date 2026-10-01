import styled, { css } from 'styled-components';

/* The contact block's proportions, taken from the design at 1728x907: 150px
   either side (8.7% of the width) and an 800px block (88% of the height). */
const SIDE_GAP = '8.7vw';
const BLOCK_HEIGHT = 88;
const WIDTH_CAP = 6.3;

export const FooterWrapper = styled.footer`
  width: 100%;
  margin-top: 200px;


  padding: 0 ${({ theme }) => theme.spacing(18.75)};
  padding-bottom: 100px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0;

  ${({ theme }) => theme.media.xl} {
    margin-top: 160px;
    padding: 0 100px;
    padding-bottom: 80px;
  }

  ${({ theme }) => theme.media.lg} {
    margin-top: 140px;
    padding: 0 ${({ theme }) => theme.spacing(10)};
    padding-bottom: 60px;
  }

  ${({ theme }) => theme.media.sm} {
    margin-top: 100px;
    padding: 0 30px;
    padding-bottom: ${({ theme }) => theme.spacing(5)};
  }

  ${({ theme }) => theme.media.xs} {
    margin-top: ${({ theme }) => theme.spacing(10)};
    padding: 0 ${({ theme }) => theme.spacing(2.5)};
    padding-bottom: 30px;
  }

  /* The breakpoints above are emitted as media rules after this block, so
     declaring a variant last is not enough to beat them: each variant doubles
     its class (&&) so it wins at every width.

     Pinned, this is a whole screen rather than the end of a long page, so it
     centres in the stage and drops the spacing that separated it from whatever
     came before. Header-only, it keeps that spacing above and nothing below. */
  ${({ $pinned }) => $pinned && css`
    && {
      margin: 0;
      padding: 0 ${SIDE_GAP};
      height: 100%;
      position: relative;
      justify-content: center;
    }
  `}

  ${({ $headerOnly }) => $headerOnly && css`
    && {
      padding-bottom: 0;
    }
  `}
`;

export const SectionHeader = styled.div`
  width: 100%;

  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 400px;
  box-sizing: border-box;
  margin-bottom: 100px;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity ${({ theme }) => theme.transitions.slow},
    transform ${({ theme }) => theme.transitions.slow};

  ${({ $isVisible }) => $isVisible && css`
    opacity: 1;
    transform: translateY(0);
  `}

  ${({ theme }) => theme.media.xl} {
    margin-bottom: ${({ theme }) => theme.spacing(10)};
  }

  ${({ theme }) => theme.media.lg} {
    margin-bottom: 60px;
  }

  ${({ theme }) => theme.media.sm} {
    padding: 0;
    margin-bottom: ${({ theme }) => theme.spacing(5)};
  }

  ${({ theme }) => theme.media.xs} {
    padding: 0;
    margin-bottom: 30px;
  }
`;

export const SectionHeaderText = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};

  ${({ theme }) => theme.media.sm} {
    font-size: 10px;
  }

  ${({ theme }) => theme.media.xs} {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
  }
`;



/* Nine lines of type plus eight 0.125em gaps make 10em, so a 10em block takes
   BLOCK_HEIGHT of the screen: on a 1728x907 window that is the 80px type and
   10px gaps the design was drawn at. The width cap keeps the widest line
   ("Mail  mparzick@calpoly.edu", about 12.1em) clear of the side gaps. */
const footerLineFontStyles = css`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: min(${BLOCK_HEIGHT / 10}vh, ${WIDTH_CAP}vw);
  font-size: min(${BLOCK_HEIGHT / 10}svh, ${WIDTH_CAP}vw);
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
`;
/* The block fills the same share of the screen's height on every screen, so
   the gap above and below it is the same proportion everywhere. Where the width
   caps the type (a phone held upright), the lines spread out to fill that height
   instead of shrinking the block. */
export const Lines = styled.div`
  ${footerLineFontStyles}
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.125em;
  height: ${BLOCK_HEIGHT}vh;
  height: ${BLOCK_HEIGHT}svh;
`;

export const Line = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  width: 100%;
  ${footerLineFontStyles}
  line-height: ${({ theme }) => theme.typography.lineHeight.none};
  color: ${({ theme }) => theme.colors.text};
  opacity: 0;
  transform: translateY(30px);
  transition: opacity ${({ theme }) => theme.transitions.slow},
    transform ${({ theme }) => theme.transitions.slow};
  will-change: opacity, transform;

  ${({ $isVisible, $isDimmed }) => $isVisible && css`
    opacity: ${$isDimmed ? 0.6 : 1};
    transform: translateY(0);
  `}

  /* Scroll-driven: slide down out of LineMask rather than fading up. */
  ${({ $dropIn, $isVisible, $isDimmed }) => $dropIn && css`
    /* line-height is 1, so descenders hang below the box; take them in so
       the hidden line is hidden entirely. */
    padding-bottom: 0.25em;
    opacity: ${$isDimmed ? 0.6 : 1};
    transform: translateY(${$isVisible ? '0' : '-101%'});
    transition: transform 0.6s cubic-bezier(0.77, 0, 0.175, 1);
  `}
`;

/* Clips a scroll-revealed line to its own box, so it appears to come out from
   under the line above it. */
export const LineMask = styled.div`
  overflow: hidden;
  /* Gives back the room Line takes for its descenders. */
  margin-bottom: -0.25em;
  ${footerLineFontStyles}
`;

export const LineLeft = styled.span`
  ${footerLineFontStyles}
`;

export const LineRight = styled.span`
  ${footerLineFontStyles}
  /* The negative letter-spacing also trails the last glyph, pulling the box
     in past it; give that back so LineMask doesn't clip the final letter. */
  padding-right: ${({ theme }) => theme.typography.letterSpacing.tight.replace('-', '')};
`;

export const LineLink = styled.a`
  ${footerLineFontStyles}
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  transition: opacity ${({ theme }) => theme.transitions.fast};
  letter-spacing: 0;

  &:hover {
    opacity: 0.7;
  }

  ${({ theme }) => theme.media.touch} {
    padding: 4px 0;

    &:active {
      opacity: 0.5;
    }
  }
`;

/**
 * The contact lines as a stage of their own: one screen, and the last thing on
 * the page. There is no runway past it — scrolling to the bottom leaves the
 * block sitting centred rather than carrying on past it.
 */
export const Stage = styled.section`
  width: 100%;
  position: relative;
  height: 100vh;
  height: 100svh;
`;

export const StagePin = styled.div`
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100svh;
  width: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
`;
