import styled, { css } from 'styled-components';
import { fadeInFromTop } from '~/styles/animations';

/* ========== Project Page Container ========== */
export const ProjectContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  width: 100%;
  padding: ${({ theme }) => theme.spacing(1.25)} 0;
  gap: ${({ theme }) => theme.spacing(10)};
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
`;

/* ========== Main Container ========== */
export const MainContainer = styled.section`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: ${({ $paddingBottom }) => $paddingBottom || '0'};

  ${({ theme }) => theme.media.sm} {
    padding-bottom: 0;
  }
`;

/* ========== Date Frame ========== */
export const DateFrame = styled.div`
  display: flex;
  padding: ${({ theme }) => theme.spacing(6.25)} ${({ theme }) => theme.spacing(18.75)};
  justify-content: flex-end;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.25)};
  align-self: stretch;
  opacity: 0;
  transform: translateY(50px);
  transition: opacity ${({ theme }) => theme.transitions.slow}, transform ${({ theme }) => theme.transitions.slow};

  ${({ $isVisible }) => $isVisible && css`
    opacity: 1;
    transform: translateY(0);
  `}

  ${({ theme }) => theme.media.sm} {
    display: none;
  }
`;

export const DateText = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: normal;
  letter-spacing: normal;

  ${({ theme }) => theme.media.xl} {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
  }

  ${({ theme }) => theme.media.md} {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  }

  ${({ theme }) => theme.media.sm} {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
  }

  ${({ theme }) => theme.media.xs} {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }
`;

/* ========== Content Frame ========== */
export const ContentFrame = styled.div`
  display: flex;
  padding: 0 ${({ theme }) => theme.spacing(2.5)} 0 ${({ theme }) => theme.spacing(15)};
  align-items: center;
  gap: ${({ theme }) => theme.spacing(25)};
  align-self: stretch;

  ${({ theme }) => theme.media.xl} {
    gap: ${({ theme }) => theme.spacing(18.75)};
    padding: 0 ${({ theme }) => theme.spacing(2.5)} 0 ${({ theme }) => theme.spacing(5)};
  }

  ${({ theme }) => theme.media.md} {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(5)};
    padding: ${({ theme }) => theme.spacing(2.5)};
    align-items: flex-start;
  }

  ${({ theme }) => theme.media.sm} {
    align-items: center;
    text-align: center;
  }
`;

/* ========== Image Title Frame ========== */
export const ImageTitleFrame = styled.div`
  position: relative;
  width: 740px;
  display: flex;
  align-items: center;

  ${({ theme }) => theme.media.xl} {
    width: 600px;
  }

  ${({ theme }) => theme.media.md} {
    width: 100%;
  }

  ${({ theme }) => theme.media.sm} {
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
`;

/* ========== Hero Image ========== */
export const HeroImage = styled.img`
  width: 576px;
  height: 384px;
  flex-shrink: 0;
  aspect-ratio: 3/2;
  object-fit: cover;
  opacity: 0;
  transform: translateY(50px);
  transition: opacity ${({ theme }) => theme.transitions.slow}, transform ${({ theme }) => theme.transitions.slow};

  ${({ $isVisible }) => $isVisible && css`
    opacity: 1;
    transform: translateY(0);
  `}

  ${({ theme }) => theme.media.xl} {
    width: 480px;
    height: 320px;
  }

  ${({ theme }) => theme.media.md} {
    width: 400px;
    height: 267px;
  }

  ${({ theme }) => theme.media.sm} {
    width: 300px;
    height: 200px;
  }

  ${({ theme }) => theme.media.xs} {
    width: 240px;
    height: 160px;
  }
`;

/* ========== Project Title ========== */
export const ProjectTitle = styled.h1`
  position: absolute;
  left: ${({ $left }) => $left || '198px'};
  top: ${({ $top }) => $top || '50%'};
  transform: translateY(-50%);
  width: ${({ $width }) => $width || '670px'};
  height: 1px;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.fontFamily.script};
  font-size: ${({ theme }) => theme.typography.fontSize.hero};
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  line-height: ${({ $lineHeight }) => $lineHeight || 'normal'};
  margin: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.7s ease-out, transform 0.7s ease-out;

  ${({ $isVisible }) => $isVisible ? css`
    opacity: 1;
    transform: translateY(-50%);
  ` : css`
    transform: translate(0, calc(-50% + 100px));
  `}

  ${({ theme, $leftXl }) => theme.media.xl} {
    left: ${({ $leftXl }) => $leftXl || '150px'};
    font-size: 220px;
    width: 550px;
  }

  ${({ theme }) => theme.media.md} {
    left: ${({ $leftMd }) => $leftMd || '110px'};
    font-size: 180px;
    width: 450px;
  }

  ${({ theme }) => theme.media.sm} {
    position: static;
    transform: none;
    width: auto;
    height: auto;
    text-align: center;
    font-size: ${({ theme }) => theme.typography.fontSize['8xl']};
    margin-top: ${({ theme }) => theme.spacing(2.5)};

    ${({ $isVisible }) => $isVisible ? css`
      transform: none;
    ` : css`
      transform: translateY(30px);
    `}
  }

  ${({ theme }) => theme.media.xs} {
    font-size: ${({ $fontSizeXs }) => $fontSizeXs || '50px'};
  }
`;

/* ========== Body Text ========== */
export const BodyText = styled.div`
  width: 556px;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: normal;
  opacity: 0;
  transform: translateY(50px);
  transition: opacity ${({ theme }) => theme.transitions.slow}, transform ${({ theme }) => theme.transitions.slow};

  ${({ $isVisible }) => $isVisible && css`
    opacity: 1;
    transform: translateY(0);
  `}

  ${({ theme }) => theme.media.xl} {
    width: 450px;
    font-size: 28px;
  }

  ${({ theme }) => theme.media.md} {
    width: 100%;
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  }

  ${({ theme }) => theme.media.sm} {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    text-align: center;
  }

  ${({ theme }) => theme.media.xs} {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
  }
`;

/* ========== Gallery Section ========== */
export const GallerySection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 188px;
  width: 100%;
  max-width: 1728px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(11)} ${({ theme }) => theme.spacing(21.5)} ${({ theme }) => theme.spacing(9.375)} ${({ theme }) => theme.spacing(21.5)};

  ${({ theme }) => theme.media.xl} {
    padding: ${({ theme }) => theme.spacing(11)} ${({ theme }) => theme.spacing(10)} ${({ theme }) => theme.spacing(9.375)} ${({ theme }) => theme.spacing(10)};
  }

  ${({ theme }) => theme.media.md} {
    padding: ${({ theme }) => theme.spacing(7.5)} ${({ theme }) => theme.spacing(5)} ${({ theme }) => theme.spacing(6.25)} ${({ theme }) => theme.spacing(5)};
    gap: ${({ theme }) => theme.spacing(7.5)};
  }

  ${({ theme }) => theme.media.sm} {
    padding: ${({ theme }) => theme.spacing(5)} ${({ theme }) => theme.spacing(2.5)} ${({ theme }) => theme.spacing(5)} ${({ theme }) => theme.spacing(2.5)};
    gap: ${({ theme }) => theme.spacing(5)};
    align-items: center;
  }
`;

export const GalleryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  animation: ${fadeInFromTop} 0.8s ease-out forwards;
  animation-delay: ${({ $index }) => `${($index || 0) * 0.1}s`};
  opacity: 0;

  ${({ theme }) => theme.media.sm} {
    align-items: center;
  }
`;

export const GalleryImageContainer = styled.div`
  width: 100%;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
`;

export const GalleryImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
  border-radius: 0;
  padding: ${({ theme }) => theme.spacing(1.25)};
  transition: transform ${({ theme }) => theme.transitions.normal};
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
  }

  ${({ theme }) => theme.media.touch} {
    &:active {
      transform: scale(0.98);
      opacity: 0.85;
    }
  }
`;

/* ========== YouTube / Video Styles ========== */
export const GalleryVideoContainer = styled.div`
  width: 100%;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
`;

export const YoutubeWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  background-color: ${({ theme }) => theme.colors.black};
  overflow: hidden;

  ${({ theme }) => theme.media.hoverFine} {
    cursor: none !important;

    & iframe {
      cursor: none !important;
    }
  }
`;

export const YoutubePlayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  & iframe {
    width: 100%;
    height: 100%;
  }
`;
