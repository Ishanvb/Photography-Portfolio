import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
    color-scheme: ${({ theme }) => theme.colorScheme};
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.background};
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }

  html {
    scrollbar-gutter: stable;
    scroll-behavior: smooth;
  }

  body {
    min-width: 320px;
    background-color: ${({ theme }) => theme.colors.background};
  }

  #root {
    width: 100%;
    min-height: 100vh;
  }

  img {
    image-rendering: auto;
  }

  /* Day/night switch (see ThemeModeProvider): a slow, even cross-fade. */
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 0.6s;
    animation-timing-function: ease-in-out;
  }
`;

export default GlobalStyles;
