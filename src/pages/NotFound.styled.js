import styled from 'styled-components';

export const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2.5)};
  padding: ${({ theme }) => theme.spacing(5)} ${({ theme }) => theme.spacing(2.5)};
`;

export const Code = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.script};
  font-size: 180px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  line-height: ${({ theme }) => theme.typography.lineHeight.none};

  ${({ theme }) => theme.media.sm} {
    font-size: 120px;
  }
`;

export const Message = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.7;
  margin: 0;

  ${({ theme }) => theme.media.sm} {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  }
`;

export const HomeLink = styled.a`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.background};
  background-color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(4)};
  text-decoration: none;
  margin-top: ${({ theme }) => theme.spacing(2.5)};
  transition: opacity ${({ theme }) => theme.transitions.fast};

  &:hover {
    opacity: 0.85;
  }
`;
