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
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  will-change: scroll-position;
  contain: layout paint;

  &::-webkit-scrollbar {
    display: none;
  }

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
