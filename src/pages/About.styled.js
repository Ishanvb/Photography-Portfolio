import styled, { css } from 'styled-components';

export const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  padding: 10px 0;
  padding-bottom: 0;
  box-sizing: border-box;
  position: relative;
  overflow-x: clip;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 88px;

  ${({ theme }) => theme.media.md} {
    gap: 60px;
  }

  ${({ theme }) => theme.media.sm} {
    gap: 40px;
  }

  ${({ theme }) => theme.media.xs} {
    gap: 30px;
  }
`;

export const Title = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: ${({ theme }) => theme.typography.fontSize['9xl']};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  line-height: ${({ theme }) => theme.typography.lineHeight.none};
  text-align: center;
  padding-top: 40px;
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;

  ${({ $isVisible }) => $isVisible && css`
    opacity: 1;
    transform: translateY(0);
  `}

  ${({ theme }) => theme.media.md} {
    font-size: 56px;
  }

  ${({ theme }) => theme.media.sm} {
    font-size: ${({ theme }) => theme.typography.fontSize['5xl']};
    padding-top: 20px;
  }

  ${({ theme }) => theme.media.xs} {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  }
`;

export const ContentFrame = styled.div`
  width: 940px;
  max-width: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;

  ${({ $isVisible }) => $isVisible && css`
    opacity: 1;
    transform: translateY(0);
  `}

  ${({ theme }) => theme.media.md} {
    width: 100%;
    max-width: calc(100% - 80px);
  }

  ${({ theme }) => theme.media.sm} {
    max-width: calc(100% - 40px);
  }

  ${({ theme }) => theme.media.xs} {
    max-width: calc(100% - 32px);
  }
`;

export const SectionHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 200px;
  box-sizing: border-box;

  ${({ theme }) => theme.media.md} {
    padding: 0 80px;
  }

  ${({ theme }) => theme.media.sm} {
    padding: 0 20px;
  }
`;

export const SectionHeaderText = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
`;

export const BodyText = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  width: 100%;
  text-align: center;

  ${({ theme }) => theme.media.md} {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  }

  ${({ theme }) => theme.media.sm} {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
  }

  ${({ theme }) => theme.media.xs} {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
  }
`;

export const BlurWord = styled.span`
  display: inline;
  transition: filter 0.15s ease-out, opacity 0.3s ease-out;
  will-change: filter, opacity;
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ $isHighlight, theme }) => $isHighlight
    ? theme.typography.fontWeight.semibold
    : theme.typography.fontWeight.medium};
`;

export const PhotosFrame = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  align-items: flex-start;
  width: 100%;
  margin-top: 150px;
  margin-bottom: 150px;
  opacity: 0;
  transform: translateY(-30px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  will-change: opacity, transform;

  ${({ $isVisible }) => $isVisible && css`
    opacity: 1;
    transform: translateY(0);
  `}

  ${({ theme }) => theme.media.md} {
    gap: ${({ theme }) => theme.spacing(2)};
  }

  ${({ theme }) => theme.media.sm} {
    flex-wrap: wrap;
    gap: 12px;
  }
`;

export const PhotoWrapper = styled.div`
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform ${({ theme }) => theme.transitions.normal};
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

export const PhotoLarge = styled(PhotoWrapper)`
  flex: 35;
  aspect-ratio: 16/9;

  ${({ theme }) => theme.media.sm} {
    flex: 100%;
  }
`;

export const PhotoMedium = styled(PhotoWrapper)`
  flex: 30;
  aspect-ratio: 4/3;

  ${({ theme }) => theme.media.sm} {
    flex: 1;
  }
`;

export const PhotoSmall = styled(PhotoWrapper)`
  flex: 25;
  aspect-ratio: 1/1;

  ${({ theme }) => theme.media.sm} {
    flex: 1;
  }
`;

export const InfoSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 80px;

  ${({ theme }) => theme.media.sm} {
    width: 100%;
    max-width: 100%;
    overflow: visible;
  }
`;

export const BioRow = styled.div`
  display: flex;
  align-items: flex-start;
  padding-left: 150px;

  ${({ theme }) => theme.media.md} {
    padding-left: 80px;
  }

  ${({ theme }) => theme.media.sm} {
    flex-direction: column;
    padding: 0 10px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    gap: 20px;
  }

  ${({ theme }) => theme.media.xs} {
    padding-left: 10px;
    padding-right: 10px;
  }
`;

export const BioList = styled.div`
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.media.sm} {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
`;

export const BioListItem = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
  padding-bottom: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.text};
  margin: 0;
  margin-bottom: 10px;
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity 0.4s ease-out, transform 0.4s ease-out;
  will-change: opacity, transform;

  ${({ $isVisible }) => $isVisible && css`
    opacity: 1;
    transform: translateY(0);
  `}

  ${({ theme }) => theme.media.sm} {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
  }

  ${({ theme }) => theme.media.xs} {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }
`;

export const BioTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: 68px;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  line-height: ${({ theme }) => theme.typography.lineHeight.none};
  margin-left: 150px;
  align-self: center;
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
  will-change: opacity, transform;

  ${({ $isVisible }) => $isVisible && css`
    opacity: 1;
    transform: translateY(0);
  `}

  ${({ theme }) => theme.media.md} {
    font-size: 40px;
    margin-left: 80px;
  }

  ${({ theme }) => theme.media.sm} {
    font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
    margin-left: 0;
    margin-right: 0;
    text-align: center;
    align-self: center;
  }

  ${({ theme }) => theme.media.xs} {
    font-size: 28px;
  }
`;

export const WorkRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-right: 150px;

  ${({ theme }) => theme.media.md} {
    padding-right: 80px;
  }

  ${({ theme }) => theme.media.sm} {
    flex-direction: column-reverse;
    justify-content: flex-start;
    align-items: stretch;
    padding: 0 10px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    gap: 20px;
  }

  ${({ theme }) => theme.media.xs} {
    padding-left: 10px;
    padding-right: 10px;
  }
`;

export const WorkList = styled.div`
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.media.sm} {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
`;

export const WorkListItem = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
  padding-bottom: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.text};
  margin: 0;
  margin-bottom: 10px;
  text-align: right;
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity 0.4s ease-out, transform 0.4s ease-out;
  will-change: opacity, transform;

  ${({ $isVisible }) => $isVisible && css`
    opacity: 1;
    transform: translateY(0);
  `}

  ${({ theme }) => theme.media.sm} {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: right;
  }

  ${({ theme }) => theme.media.xs} {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }
`;

export const WorkTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: 68px;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  line-height: ${({ theme }) => theme.typography.lineHeight.none};
  margin-right: 150px;
  align-self: center;
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
  will-change: opacity, transform;

  ${({ $isVisible }) => $isVisible && css`
    opacity: 1;
    transform: translateY(0);
  `}

  ${({ theme }) => theme.media.md} {
    font-size: 40px;
    margin-right: 80px;
  }

  ${({ theme }) => theme.media.sm} {
    font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
    margin-left: 0;
    margin-right: 0;
    text-align: center;
    align-self: center;
  }

  ${({ theme }) => theme.media.xs} {
    font-size: 28px;
  }
`;