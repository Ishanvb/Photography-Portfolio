import styled, { createGlobalStyle } from 'styled-components';

export const AdminReset = createGlobalStyle`
  body { background: #0d0d0d; }
`;

export const Shell = styled.div`
  min-height: 100vh;
  background: #0d0d0d;
  color: #f2f2f2;
  font-family: system-ui, -apple-system, sans-serif;
`;

export const Bar = styled.header`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px;
  border-bottom: 1px solid #222;
  position: sticky;
  top: 0;
  background: #0d0d0d;
  z-index: 10;
  flex-wrap: wrap;
`;

export const Tab = styled.button`
  padding: 16px 4px;
  margin-right: 20px;
  background: none;
  border: none;
  border-bottom: 2px solid ${(p) => (p.$active ? '#f2f2f2' : 'transparent')};
  color: ${(p) => (p.$active ? '#f2f2f2' : '#7a7a7a')};
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  &:hover { color: #f2f2f2; }
`;

export const Spacer = styled.div`flex: 1;`;

export const Main = styled.main`
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 20px 96px;
`;

export const H2 = styled.h2`
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 500;
`;

export const Hint = styled.p`
  margin: 0 0 24px;
  font-size: 13px;
  line-height: 1.6;
  color: #8a8a8a;
`;

export const Field = styled.label`
  display: block;
  margin-bottom: 18px;

  > span {
    display: block;
    margin-bottom: 6px;
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #8a8a8a;
  }
`;

const control = `
  width: 100%;
  padding: 10px 12px;
  background: #161616;
  border: 1px solid #2a2a2a;
  color: #f2f2f2;
  font-family: inherit;
  font-size: 14px;
  border-radius: 2px;
  &:focus { outline: none; border-color: #555; }
`;

export const Input = styled.input`${control}`;
export const Select = styled.select`${control}`;
export const Textarea = styled.textarea`${control} min-height: 120px; resize: vertical; line-height: 1.6;`;

export const Button = styled.button`
  padding: 10px 18px;
  font-family: inherit;
  font-size: 14px;
  border-radius: 2px;
  cursor: pointer;
  border: 1px solid transparent;
  background: ${(p) => (p.$variant === 'ghost' ? 'transparent' : '#f2f2f2')};
  color: ${(p) => (p.$variant === 'ghost' ? '#c2c2c2' : '#0d0d0d')};
  border-color: ${(p) => (p.$variant === 'ghost' ? '#333' : 'transparent')};

  &:hover:not(:disabled) { opacity: 0.85; }
  &:disabled { opacity: 0.45; cursor: default; }
`;

export const Danger = styled(Button)`
  background: transparent;
  border-color: #4a2020;
  color: #d97a7a;
`;

export const Row = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

export const Drop = styled.div`
  border: 1px dashed ${(p) => (p.$over ? '#f2f2f2' : '#333')};
  background: ${(p) => (p.$over ? '#181818' : 'transparent')};
  border-radius: 3px;
  padding: 40px 20px;
  text-align: center;
  color: #8a8a8a;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 20px;
`;

export const Thumb = styled.div`
  position: relative;
  aspect-ratio: 3 / 2;
  background: #161616;
  border: 1px solid #262626;
  overflow: hidden;

  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

export const ThumbBar = styled.div`
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
  font-size: 11px;
  color: #ddd;
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  color: #ddd;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 4px;
  &:hover { color: #fff; }
  &:disabled { opacity: 0.3; cursor: default; }
`;

export const Card = styled.div`
  border: 1px solid #222;
  border-radius: 3px;
  padding: 18px;
  margin-bottom: 12px;
  background: #121212;
`;

export const Progress = styled.div`
  height: 2px;
  background: #262626;
  margin-top: 10px;
  overflow: hidden;

  > div {
    height: 100%;
    width: ${(p) => Math.round((p.$value ?? 0) * 100)}%;
    background: #f2f2f2;
    transition: width 0.2s ease;
  }
`;

export const Note = styled.p`
  margin: 12px 0 0;
  font-size: 13px;
  color: ${(p) => (p.$error ? '#ff6b6b' : '#6fbf73')};
`;

export const Code = styled.code`
  display: block;
  margin-top: 10px;
  padding: 10px 12px;
  background: #0a0a0a;
  border: 1px solid #262626;
  font-size: 12px;
  word-break: break-all;
  color: #b8b8b8;
`;
