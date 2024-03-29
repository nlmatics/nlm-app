import { useEffect, useState } from 'react';
import ThemeContext from './ThemContext';

const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

const ViewerCssTheme = {
  LIGHT: 1,
  DARK: 2,
};

const setStylesByTheme = theme => {
  if (theme === THEMES.DARK) {
    document
      .getElementById(`nlm-theme-${THEMES.LIGHT}`)
      .setAttribute('rel', 'stylesheet/ignore');
    document
      .getElementById(`nlm-theme-${THEMES.DARK}`)
      .setAttribute('rel', 'stylesheet');
  } else {
    document
      .getElementById(`nlm-theme-${THEMES.LIGHT}`)
      .setAttribute('rel', 'stylesheet');
    document
      .getElementById(`nlm-theme-${THEMES.DARK}`)
      .setAttribute('rel', 'stylesheet/ignore');
  }
};

const setPdfViewerTheme = themeName => {
  const pdfjsPreferences = JSON.parse(
    localStorage.getItem('pdfjs.preferences')
  );
  localStorage.setItem(
    'pdfjs.preferences',
    JSON.stringify({
      ...pdfjsPreferences,
      viewerCssTheme:
        themeName === THEMES.DARK ? ViewerCssTheme.DARK : ViewerCssTheme.LIGHT,
    })
  );
};

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(THEMES.LIGHT);

  useEffect(() => {
    let themeName = localStorage.getItem('theme-name');
    if (!themeName) {
      if (window?.matchMedia('(prefers-color-scheme: dark)').matches) {
        themeName = THEMES.DARK;
      } else {
        themeName = THEMES.LIGHT;
      }
    }
    setStylesByTheme(themeName);
    setTheme(themeName);
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('theme-name', themeName);
    setPdfViewerTheme(themeName);
  }, []);

  const switchTheme = () => {
    const themeName = theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    setStylesByTheme(themeName);
    setTheme(themeName);
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('theme-name', themeName);
    setPdfViewerTheme(themeName);
  };

  const BRAND_COLOR = '#03989e';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        switchTheme,
        BRAND_COLOR,
        THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
