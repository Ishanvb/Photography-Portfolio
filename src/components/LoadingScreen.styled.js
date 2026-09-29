import styled from 'styled-components';
import { spin } from '~/styles/animations';

export const Screen = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex.loading};
  opacity: ${({ $isFading }) => ($isFading ? 0 : 1)};
  transition: opacity ${({ theme }) => theme.transitions.slow};
  pointer-events: ${({ $isFading }) => ($isFading ? 'none' : 'auto')};
`;

export const Logo = styled.div`
  width: 60px;
  height: 60px;
`;

export const FlowerSpinner = styled.svg`
  width: 100%;
  height: 100%;
  animation: ${spin} 2s linear infinite;
`;
