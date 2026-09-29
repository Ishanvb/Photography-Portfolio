import { createContext, useContext } from 'react';

/** Which way round the site is: 'dark' (its own look) or 'light' (day mode). */
export const ThemeModeContext = createContext({ mode: 'dark', toggleMode: () => {} });

export const useThemeMode = () => useContext(ThemeModeContext);
