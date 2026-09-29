import styled, { css } from 'styled-components';

export const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 73px;
  padding: 0 ${({ theme }) => theme.spacing(8)};
  padding-top: ${({ theme }) => theme.spacing(3)};
  margin-bottom: 20px;
  position: relative;
  /* Over the gallery stage, which spans the window and would otherwise swallow
     the nav's clicks while the gallery is open. */
  z-index: ${({ theme }) => theme.zIndex.header};
  box-sizing: border-box;

  ${({ theme }) => theme.media.sm} {
    justify-content: center;
    padding: 0 ${({ theme }) => theme.spacing(4)};
    padding-top: 14px;
    gap: 20px;
    height: 60px;
  }

  ${({ theme }) => theme.media.xs} {
    gap: 12px;
    padding: 0 ${({ theme }) => theme.spacing(3)};
    padding-top: 12px;
    height: 50px;
  }
`;

export const HeaderButton = styled.button`
  background: none;
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.text};
  padding: 0 ${({ theme }) => theme.spacing(1)};
  cursor: pointer;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  transition: all ${({ theme }) => theme.transitions.fast};

  /* Active (selected) page: full opacity */
  ${({ $isActive, theme }) => $isActive && css`
    color: ${theme.colors.text};
  `}

  /* Non-active pages: half opacity */
  ${({ $isActive, theme }) => !$isActive && css`
    color: ${theme.colors.textDimmed};
  `}

  /* Hover on non-active: fill to full opacity */
  ${({ $isHovered, $isActive, theme }) => $isHovered && !$isActive && css`
    color: ${theme.colors.text};
    border-top-color: ${theme.colors.text};
  `}

  /* Hover on active (current page): fill to half opacity */
  ${({ $isHovered, $isActive, theme }) => $isHovered && $isActive && css`
    color: ${theme.colors.textDimmed};
    border-top-color: ${theme.colors.textDimmed};
  `}

  & p {
    margin: 0;
    padding: 0;
  }

  ${({ theme }) => theme.media.sm} {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    padding: 0 4px;

    /* Active page: full opacity (same as desktop) */
    ${({ $isActive, theme }) => $isActive && css`
      color: ${theme.colors.text};
    `}

    /* Non-active pages: half opacity (same as desktop) */
    ${({ $isActive, theme }) => !$isActive && css`
      color: ${theme.colors.textDimmed};
    `}
  }

  ${({ theme }) => theme.media.xs} {
    font-size: 10px;
    padding: 0 2px;

    /* Active page: full opacity (same as desktop) */
    ${({ $isActive, theme }) => $isActive && css`
      color: ${theme.colors.text};
    `}

    /* Non-active pages: half opacity (same as desktop) */
    ${({ $isActive, theme }) => !$isActive && css`
      color: ${theme.colors.textDimmed};
    `}
  }

  /* Touch device styles */
  ${({ theme }) => theme.media.touch} {
    padding: 12px ${({ theme }) => theme.spacing(2)};
    min-height: 44px;

    /* Active page: full opacity - higher specificity */
    ${({ $isActive, theme }) => $isActive && css`
      color: ${theme.colors.text} !important;
      border-top-color: ${theme.colors.text};

      &:active {
        color: ${theme.colors.text} !important;
        border-top-color: ${theme.colors.text};
      }
    `}

    /* Non-active pages: half opacity - higher specificity */
    ${({ $isActive, theme }) => !$isActive && css`
      color: ${theme.colors.textDimmed} !important;
      border-top-color: ${theme.colors.textDimmed};

      &:active {
        color: ${theme.colors.textDimmed} !important;
        border-top-color: ${theme.colors.textDimmed};
      }
    `}
  }
`;

export const AnimatedWord = styled.span`
  display: inline-flex;
`;

export const Letter = styled.span`
  position: relative;
  overflow: hidden;
  height: 22px;
  display: inline-block;

  ${({ theme }) => theme.media.sm} {
    height: 15px;
  }

  ${({ theme }) => theme.media.xs} {
    height: 13px;
  }
`;

export const LetterStack = styled.span`
  display: block;
  height: 200%;
  transform: translateY(0%);
  transition: transform ${({ theme }) => theme.transitions.smooth};

  /* Stack letters vertically */
  & span {
    display: block;
    height: 50%;
  }

  /* Exit animation: letters scroll UP (when clicking) */
  ${({ $isClicking }) => $isClicking && css`
    transform: translateY(-50%);
  `}

  /* Enter animation setup: position letters above (hidden), no transition */
  ${({ $isEnterReady }) => $isEnterReady && css`
    transform: translateY(-50%);
    transition: none !important;
  `}

  /* Enter animation: letters scroll DOWN into view */
  ${({ $isEntering, theme }) => $isEntering && css`
    transform: translateY(0%);
    transition: transform ${theme.transitions.smooth};
  `}
`;
