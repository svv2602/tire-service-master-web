import { useState, useEffect } from 'react';

const THEME_STORAGE_KEY = 'tvoya_shina_theme_mode';

export type ThemeMode = 'light' | 'dark';

export const useThemeMode = () => {
  // Получаем сохраненную тему или определяем системную
  const getInitialTheme = (): ThemeMode => {
    // Сначала проверяем localStorage
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      return savedTheme;
    }

    // Если нет сохраненной темы, используем системную
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  };

  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme);

  // Функция переключения темы
  const toggleTheme = () => {
    const newMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };

  // Сохраняем тему в localStorage при изменении
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  // Слушаем изменения системной темы
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Обновляем тему только если пользователь не выбирал вручную
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (!savedTheme) {
        setThemeMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return {
    themeMode,
    toggleTheme,
    isDarkMode: themeMode === 'dark',
  };
}; 