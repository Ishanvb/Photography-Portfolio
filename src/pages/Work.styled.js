import styled, { css } from 'styled-components';
import { fadeInFromLeft, fadeInFromTop, blink } from '~/styles/animations';

export const Page = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 10px 0;
  padding-bottom: 75px;
  box-sizing: border-box;
  overflow-x: hidden;
`;

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  padding: 0 250px;
  margin-top: ${({ theme }) => theme.spacing(2.5)};
  margin-bottom: ${({ theme }) => theme.spacing(11)};
  box-sizing: border-box;

  ${({ theme }) => theme.media.sm} {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    padding: 0 ${({ theme }) => theme.spacing(2.5)};
    margin-top: 10px;
    margin-bottom: ${({ theme }) => theme.spacing(5)};
  }

  ${({ theme }) => theme.media.xs} {
    padding: 0 ${({ theme }) => theme.spacing(2)};
    margin-bottom: 30px;
  }
`;

export const TitleFrame = styled.div`
  flex-shrink: 0;

  ${({ theme }) => theme.media.sm} {
    text-align: right;
  }
`;

// LetterStack must be declared before components that reference it
export const LetterStack = styled.span`
  display: block;
  height: 200%;
  transform: translateY(-50%);
  transition: transform ${({ theme }) => theme.transitions.smooth};

  & span {
    display: block;
    height: 50%;
  }
`;

export const CategoryText = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-style: normal;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: normal;
  letter-spacing: -1.5px;
  margin: 0;

  ${({ theme }) => theme.media.sm} {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    letter-spacing: -0.5px;
  }

  ${({ theme }) => theme.media.xs} {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    letter-spacing: -0.3px;
  }
`;

export const CategoryLine = styled.div``;

export const DropdownItems = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease;
  order: 1;
`;

export const DropdownItem = styled.div`
  display: flex;
  padding: 10px;
  align-items: center;
  gap: 10px;
  align-self: stretch;
  border-bottom: 2px solid ${({ theme }) => theme.colors.text};
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity ${({ theme }) => theme.transitions.normal},
              transform ${({ theme }) => theme.transitions.normal};

  &:hover ${LetterStack} {
    transform: translateY(0%);
  }

  ${({ theme }) => theme.media.touch} {
    padding: 14px 10px;
    min-height: 44px;

    &:active {
      opacity: 0.7;
    }

    &:active ${LetterStack} {
      transform: translateY(0%);
    }
  }
`;

export const CategoryDropdown = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 320px;
  opacity: 0;

  ${({ $isVisible }) => $isVisible && css`
    animation: ${fadeInFromLeft} 0.8s ease-out forwards;
  `}

  ${({ $isOpen }) => $isOpen && css`
    & ${CategoryLine} {
      order: 2;
    }

    & ${DropdownItems} {
      max-height: 600px;
    }

    & ${DropdownItem} {
      opacity: 1;
      transform: translateY(0);
    }

    & ${DropdownItem}:nth-child(1) { transition-delay: 0.05s; }
    & ${DropdownItem}:nth-child(2) { transition-delay: 0.1s; }
    & ${DropdownItem}:nth-child(3) { transition-delay: 0.15s; }
    & ${DropdownItem}:nth-child(4) { transition-delay: 0.2s; }
    & ${DropdownItem}:nth-child(5) { transition-delay: 0.25s; }
    & ${DropdownItem}:nth-child(6) { transition-delay: 0.3s; }
  `}

  ${({ theme }) => theme.media.sm} {
    max-width: 200px;
  }

  ${({ theme }) => theme.media.xs} {
    max-width: 140px;
  }
`;

export const CategoryItem = styled.div`
  display: flex;
  padding: 0;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(5)};
  align-self: stretch;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  order: 0;
  margin-bottom: 10px;

  & ${CategoryText} {
    font-size: ${({ theme }) => theme.typography.fontSize['7xl']};
    letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
    line-height: ${({ theme }) => theme.typography.lineHeight.none};
    margin: 0;
  }

  &:hover ${LetterStack} {
    transform: translateY(0%);
  }

  ${({ theme }) => theme.media.sm} {
    gap: ${({ theme }) => theme.spacing(2)};
    cursor: pointer;

    & ${CategoryText} {
      font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    }
  }

  ${({ theme }) => theme.media.xs} {
    gap: 10px;

    & ${CategoryText} {
      font-size: 28px;
    }
  }
`;

export const CategoryArrow = styled.div`
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 12px solid ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: transform ${({ theme }) => theme.transitions.normal},
              border-top-color ${({ theme }) => theme.transitions.fast};
  flex-shrink: 0;

  ${({ $isOpen }) => $isOpen && css`
    transform: rotate(180deg);
  `}

  &.cursor-nearby {
    border-top-color: transparent;
  }

  ${({ theme }) => theme.media.sm} {
    border-left-width: 5px;
    border-right-width: 5px;
    border-top-width: 5px;
  }

  ${({ theme }) => theme.media.xs} {
    border-left-width: 4px;
    border-right-width: 4px;
    border-top-width: 4px;
  }
`;

export const AnimatedCategory = styled.span`
  display: inline-flex;
`;

export const Letter = styled.span`
  position: relative;
  overflow: hidden;
  height: 32px;
  display: inline-block;

  ${({ theme }) => theme.media.sm} {
    height: 18px;
  }

  ${({ theme }) => theme.media.xs} {
    height: 16px;
  }
`;

export const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: ${({ theme }) => theme.typography.fontSize['7xl']};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  color: ${({ theme }) => theme.colors.text};
  text-align: right;
  margin: 0;
  line-height: ${({ theme }) => theme.typography.lineHeight.none};
  min-height: 69px;

  ${({ theme }) => theme.media.sm} {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    min-height: 36px;
  }

  ${({ theme }) => theme.media.xs} {
    font-size: 28px;
    min-height: 28px;
  }
`;

export const Cursor = styled.span`
  animation: ${blink} 1s infinite;
  margin-left: 2px;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(11)};
  width: 100%;
  max-width: 1728px;
  padding-top: ${({ theme }) => theme.spacing(2.5)};
  padding-left: 250px;
  padding-right: 250px;

  ${({ theme }) => theme.media.sm} {
    padding-left: ${({ theme }) => theme.spacing(2.5)};
    padding-right: ${({ theme }) => theme.spacing(2.5)};
    gap: ${({ theme }) => theme.spacing(5)};
  }

  ${({ theme }) => theme.media.xs} {
    padding-left: ${({ theme }) => theme.spacing(2)};
    padding-right: ${({ theme }) => theme.spacing(2)};
    gap: 30px;
  }
`;

export const GalleryInstruction = styled.div`
  display: none;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 10px 0;
  margin-bottom: -87px;
  opacity: 0;

  ${({ $isVisible, $isContentVisible }) => $isContentVisible && $isVisible && css`
    animation: ${fadeInFromTop} 0.8s ease-out forwards;
  `}

  ${({ theme }) => theme.media.sm} {
    display: flex;
    margin-bottom: -32px;
  }
`;

export const InstructionText = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: rgb(255, 255, 255);
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
  position: relative;
  overflow: hidden;
  display: inline-block;

  & span {
    position: relative;
    z-index: 1;
  }

  ${({ theme }) => theme.media.sm} {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
  }

  ${({ theme }) => theme.media.xs} {
    font-size: 8px;
  }
`;

export const ProjectPresentation = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  opacity: 0;
  animation: ${fadeInFromTop} 0.8s ease-out forwards;
  animation-delay: ${({ $index }) => {
    if ($index === 0) return '0s';
    return `${$index * 0.1}s`;
  }};
`;

export const ImageContainer = styled.div`
  width: 100%;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.backgroundLight};

  & img {
    width: 100%;
    height: auto;
    object-fit: cover;
    display: block;
    border-radius: 0;
    padding: 10px;
    transition: transform ${({ theme }) => theme.transitions.normal};
    cursor: pointer;

    &:hover {
      transform: scale(1.05);
    }

    ${({ theme }) => theme.media.sm} {
      padding: 4px;
    }

    ${({ theme }) => theme.media.touch} {
      &:active {
        transform: scale(0.98);
        opacity: 0.85;
      }
    }
  }
`;

export const Caption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing(1)};
  gap: 2px;

  ${({ theme }) => theme.media.sm} {
    margin-top: 4px;
  }
`;

export const Title = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  line-height: normal;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;

  ${({ theme }) => theme.media.sm} {
    font-size: 11px;
  }

  ${({ theme }) => theme.media.xs} {
    font-size: 10px;
  }
`;

export const Description = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  line-height: normal;
  color: ${({ theme }) => theme.colors.textDimmed};
  margin: 0;

  ${({ theme }) => theme.media.sm} {
    font-size: 11px;
  }

  ${({ theme }) => theme.media.xs} {
    font-size: 10px;
  }
`;
