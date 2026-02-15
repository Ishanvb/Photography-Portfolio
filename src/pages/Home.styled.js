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

  ${({ theme }) => theme.media.sm} {
    display: none;
  }
`;

export const SelectedWorksText = styled.span`
  position: relative;
  overflow: hidden;
  display: inline-block;
  background-color: ${({ theme }) => theme.colors.text};
  padding: 4px 10px;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-color: ${({ theme }) => theme.colors.background};
    transform: translateX(0%);
    z-index: 2;
    pointer-events: none;
    transition: transform ${({ theme }) => theme.transitions.reveal};
    ${({ $isVisible }) => $isVisible && css`
      transform: translateX(101%);
    `}
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: ${({ theme }) => theme.colors.accent};
    transform: translateX(100%);
    z-index: 0;
    pointer-events: none;
    transition: transform ${({ theme }) => theme.transitions.revealFast};
  }

  &:hover::before {
    transform: translateX(0%);
  }
`;

export const SelectedWorksInner = styled.span`
  position: relative;
  z-index: 1;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
  color: ${({ theme }) => theme.colors.background};
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
  color: rgb(255, 255, 255);
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};

  ${({ theme }) => theme.media.xs} {
    font-size: 8px;
  }
`;
