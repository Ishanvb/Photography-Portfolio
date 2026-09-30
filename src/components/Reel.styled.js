import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  overflow: hidden;
  margin-bottom: 8vh;

  ${({ theme }) => theme.media.sm} {
    margin-bottom: 6vh;
  }

  ${({ theme }) => theme.media.xs} {
    margin-bottom: 5vh;
  }

  ${({ theme }) => theme.media.heightMobileLandscape} {
    margin-bottom: 4vh;
  }
`;

export const Track = styled.div`
  /* Kept out of the day/night cross-fade (see GlobalStyles). */
  view-transition-name: home-reel;
  display: flex;
  /* A phone scrolls this by touch; on desktop it stays put and the belt inside
     it moves (see Reel.jsx). */
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  contain: layout paint;
  /* Hidden until the auto-scroll has begun, then faded in already moving. */
  opacity: ${({ $waiting }) => ($waiting ? 0 : 1)};
  transition: opacity 0.4s ease-out;

  &::-webkit-scrollbar {
    display: none;
  }
`;

/**
 * Carries the belt through the fast start. The ramp and the steady loop each
 * need an element of their own to run on the compositor (see Reel.jsx).
 */
export const Carriage = styled.div`
  flex-shrink: 0;
  will-change: transform;
`;

/** The photos in a row. Moved by transform on desktop, on its own GPU layer. */
export const Belt = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing(4)};
  will-change: transform;

  ${({ theme }) => theme.media.sm} {
    gap: ${({ theme }) => theme.spacing(2)};
  }

  ${({ theme }) => theme.media.xs} {
    gap: 12px;
  }
`;

export const Frame = styled.div`
  flex-shrink: 0;
  width: ${({ $isNarrow }) => ($isNarrow ? '342px' : '755px')};

  ${({ theme }) => theme.media.heightShort} {
    width: ${({ $isNarrow }) => ($isNarrow ? '272px' : '600px')};
  }

  ${({ theme }) => theme.media.heightVeryShort} {
    width: ${({ $isNarrow }) => ($isNarrow ? '227px' : '500px')};
  }

  ${({ theme }) => theme.media.sm} {
    width: ${({ $isNarrow }) => ($isNarrow ? '50vw' : '70vw')};
    min-width: ${({ $isNarrow }) => ($isNarrow ? '180px' : '260px')};
  }

  ${({ theme }) => theme.media.xs} {
    width: ${({ $isNarrow }) => ($isNarrow ? '55vw' : '75vw')};
    min-width: ${({ $isNarrow }) => ($isNarrow ? '160px' : '240px')};
  }
`;

export const ImageContainer = styled.div`
  width: 100%;
  aspect-ratio: ${({ $isNarrow }) => ($isNarrow ? '342 / 481' : '755 / 501')};
  overflow: hidden;

  ${({ theme }) => theme.media.heightShort} {
    aspect-ratio: ${({ $isNarrow }) => ($isNarrow ? '272 / 382' : '600 / 398')};
  }

  ${({ theme }) => theme.media.heightVeryShort} {
    aspect-ratio: ${({ $isNarrow }) => ($isNarrow ? '227 / 319' : '500 / 332')};
  }
`;

export const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
