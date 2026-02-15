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

export const TitleText = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: ${({ theme }) => theme.typography.fontSize['6xl']};
  line-height: normal;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tighter};
  margin: 0;
  padding: 0;
  text-align: left;
  position: relative;
  height: 72px;
  display: inline-block;

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
