import styled from 'styled-components';

export const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0d0d0d;
  padding: 24px;
`;

export const Card = styled.div`
  width: 100%;
  max-width: 380px;
  padding: 36px 32px;
  border: 1px solid #262626;
  background: #141414;
  color: #f2f2f2;
  font-family: system-ui, -apple-system, sans-serif;
`;

export const Title = styled.h1`
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.02em;
`;

export const Body = styled.p`
  margin: 0 0 28px;
  font-size: 14px;
  line-height: 1.6;
  color: #9a9a9a;
`;

export const Button = styled.button`
  width: 100%;
  padding: 13px 16px;
  font-size: 14px;
  font-family: inherit;
  color: #0d0d0d;
  background: #f2f2f2;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover:not(:disabled) { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: default; }
`;

export const Error = styled.p`
  margin: 18px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: #ff6b6b;
`;
