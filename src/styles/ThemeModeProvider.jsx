import { useCallback, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { ThemeProvider } from 'styled-components';
import theme, { lightTheme } from '~/styles/theme';
import { ThemeModeContext } from '~/styles/themeMode';

const STORAGE_KEY = 'site-theme';

const readStoredMode = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
};

/**
 * Holds day/night mode and hands the matching theme to styled-components.
 *
 * Switching cross-fades the whole page from one mode's colours to the other's,
 * where the browser can snapshot the page for it (the View Transitions API);
 * elsewhere, or with reduced motion asked for, it simply swaps.
 */
function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(readStoredMode);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Private windows and blocked storage just don't remember the choice.
    }
    const active = mode === 'light' ? lightTheme : theme;
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', active.colors.background);
  }, [mode]);

  const toggleMode = useCallback(() => {
    const next = mode === 'light' ? 'dark' : 'light';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!document.startViewTransition || reduced) {
      setMode(next);
      return;
    }

    document.startViewTransition(() => {
      flushSync(() => setMode(next));
    });
  }, [mode]);

  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={mode === 'light' ? lightTheme : theme}>
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export default ThemeModeProvider;
