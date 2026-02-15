const SPACING_BASE = 8;

const theme = {
  spacing: (multiplier) => `${multiplier * SPACING_BASE}px`,

  colors: {
    background: '#0c0c0c',
    backgroundLight: '#1a1a1a',
    text: '#ffffe1',
    accent: '#ffbd2f',
    textDimmed: 'rgba(255, 255, 225, 0.5)',
    textHidden: 'rgba(255, 255, 225, 0)',
    textLight: 'rgba(255, 255, 225, 0.7)',
    backgroundOverlay: 'rgba(255, 255, 255, 0.95)',
    cursorBg: '#fff',
    black: '#000',
    white: '#fff',
    transparent: 'transparent',
    linkBlue: '#0088ff',
    accentDimmed: 'rgba(255, 189, 47, 0.5)',
  },

  typography: {
    fontFamily: {
      primary: "'Manrope', sans-serif",
      script: "'Luxurious Script', cursive",
      system: "system-ui, Avenir, Helvetica, Arial, sans-serif",
    },
    fontSize: {
      xs: '9px',
      sm: '12px',
      base: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '32px',
      '4xl': '36px',
      '5xl': '48px',
      '6xl': '60px',
      '7xl': '69px',
      '8xl': '80px',
      '9xl': '156px',
      hero: '240px',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
    },
    letterSpacing: {
      tight: '-0.08em',
      tighter: '-5.52px',
      normal: '0',
      wide: '0.5px',
      wider: '0.02em',
    },
    lineHeight: {
      none: 1,
      tight: 1.2,
      snug: 1.4,
      normal: 1.5,
      relaxed: 2,
    },
  },

  breakpoints: {
    xs: '480px',
    sm: '768px',
    md: '1024px',
    lg: '1200px',
    xl: '1400px',
  },

  media: {
    xs: '@media (max-width: 480px)',
    sm: '@media (max-width: 768px)',
    md: '@media (max-width: 1024px)',
    lg: '@media (max-width: 1200px)',
    xl: '@media (max-width: 1400px)',
    touch: '@media (hover: none)',
    touchCoarse: '@media (hover: none) and (pointer: coarse)',
    hoverFine: '@media (hover: hover) and (pointer: fine)',
    heightTall: '@media (min-height: 1100px) and (min-width: 769px)',
    heightMedTall: '@media (max-height: 1099px) and (min-height: 1000px) and (min-width: 769px)',
    heightMed: '@media (max-height: 999px) and (min-height: 900px) and (min-width: 769px)',
    heightShort: '@media (max-height: 899px) and (min-height: 800px) and (min-width: 769px)',
    heightVeryShort: '@media (max-height: 799px) and (min-width: 769px)',
    heightMobileLandscape: '@media (max-height: 500px) and (max-width: 768px)',
  },

  transitions: {
    fast: '0.2s ease',
    normal: '0.3s ease',
    slow: '0.5s ease-out',
    spring: '0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    smooth: '0.45s cubic-bezier(0.76, 0, 0.24, 1)',
    reveal: '0.7s cubic-bezier(0.77, 0, 0.175, 1)',
    revealFast: '0.4s cubic-bezier(0.77, 0, 0.175, 1)',
    revealSlow: '0.8s cubic-bezier(0.77, 0, 0.175, 1)',
  },

  zIndex: {
    cursor: 9999,
    loading: 10000,
    scrollReel: 9999,
    header: 1000,
    dropdown: 100,
  },
};

export default theme;
