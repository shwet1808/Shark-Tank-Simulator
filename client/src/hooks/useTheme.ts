import { useState, useEffect, useCallback } from 'react';

// Persist the user's theme preference across sessions
export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'shark-theme';

export function useTheme() {
  // Read initial value from localStorage, defaulting to dark mode
  const [isDark, setIsDark] = useState<ThemeMode>('dark');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored === 'dark' || stored === 'light') {
      setIsDark(stored);
    }
  }, []);

  // Reflect the theme on the document element whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDark === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, isDark);
  }, [isDark]);

  const toggle = useCallback(() => {
    setIsDark((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { isDark, toggle, isDarkMode: isDark === 'dark' };
}
