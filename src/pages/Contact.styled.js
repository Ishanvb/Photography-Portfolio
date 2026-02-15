import styled, { css } from 'styled-components';

export const Container = styled.div`
  width: 100%;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
`;

export const LinesContainer = styled.div`
  flex: 1;
  padding: 0 150px;
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  position: relative;
  z-index: 1;

  ${({ theme }) => theme.media.xl} {
    padding: 0 100px;
    padding-bottom: 100px;
  }

  ${({ theme }) => theme.media.lg} {
    padding: 0 80px;
    padding-bottom: 80px;
  }

  ${({ theme }) => theme.media.sm} {
    padding: 0 30px;
    padding-bottom: 40px;
    gap: 6px;
  }

  ${({ theme }) => theme.media.xs} {
    padding: 0 20px;
    padding-bottom: 30px;
    gap: 4px;
  }
`;

export const ContactLine = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  width: 100%;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: calc((100vh - 277px) / 9);
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  line-height: ${({ theme }) => theme.typography.lineHeight.none};
  color: ${({ theme }) => theme.colors.text};
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
  transition-delay: ${({ $index }) => `${0.1 + $index * 0.05}s`};

  ${({ $isVisible }) => $isVisible && css`
    opacity: 1;
    transform: translateY(0);
  `}

  ${({ $isDimmed, $isVisible }) => $isDimmed && $isVisible && css`
    opacity: 0.6;
  `}

  &::after {
    content: '';
    position: absolute;
    top: -0.15em;
    left: 0;
    width: calc(100% + 6px);
    height: calc(100% + 0.35em);
    background-color: ${({ theme }) => theme.colors.text};
    pointer-events: none;
    transform-origin: right center;
    transition: transform 0.8s cubic-bezier(0.77, 0, 0.175, 1);
    transition-delay: ${({ $index }) => `${0.3 + $index * 0.1}s`};

    ${({ $isRevealed }) => $isRevealed && css`
      transform: scaleX(0);
    `}
  }

  ${({ theme }) => theme.media.sm} {
    font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  }

  ${({ theme }) => theme.media.xs} {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  }
`;

export const LineLeft = styled.span`
  position: relative;
  z-index: 1;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: calc((100vh - 277px) / 9);
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};

  ${({ theme }) => theme.media.sm} {
    font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  }

  ${({ theme }) => theme.media.xs} {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  }
`;

export const LineRight = styled.span`
  position: relative;
  z-index: 1;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: calc((100vh - 277px) / 9);
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};

  ${({ theme }) => theme.media.sm} {
    font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  }

  ${({ theme }) => theme.media.xs} {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  }
`;

export const ContactLink = styled.a`
  position: relative;
  z-index: 1;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: calc((100vh - 277px) / 9);
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  color: ${({ theme }) => theme.colors.text} !important;
  text-decoration: none;
  letter-spacing: 0;

  &:visited {
    color: ${({ theme }) => theme.colors.text} !important;
  }

  ${({ $isVisible, theme }) => $isVisible && css`
    &:hover {
      opacity: 0.7;
      transition: opacity ${theme.transitions.fast};
    }
  `}

  ${({ theme }) => theme.media.sm} {
    font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
    text-decoration: underline !important;
  }

  ${({ theme }) => theme.media.xs} {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  }

  ${({ theme }) => theme.media.touch} {
    padding: 4px 0;

    &:active {
      opacity: 0.5;
    }
  }
`;
