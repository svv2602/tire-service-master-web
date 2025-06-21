// src/contexts/ThemeContext.tsx
// Контекст для управления темой приложения

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from '../styles/theme/theme';

// Тип для режима темы
export type ThemeMode = 'light' | 'dark';

// Интерфейс контекста темы
interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

// Создание контекста
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Ключ для хранения темы в localStorage
const THEME_MODE_KEY = 'themeMode';

/**
 * Провайдер темы для приложения
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Состояние для режима темы - по умолчанию темная тема
  const [mode, setMode] = useState<ThemeMode>('dark');
  
  // Загрузка предпочтений пользователя при инициализации
  useEffect(() => {
    const savedMode = localStorage.getItem(THEME_MODE_KEY) as ThemeMode | null;
    
    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      setMode(savedMode);
    } else {
      // По умолчанию устанавливаем темную тему вместо определения системных предпочтений
      setMode('dark');
    }
  }, []);
  
  // Функция для переключения темы
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem(THEME_MODE_KEY, newMode);
  };
  
  // Функция для установки конкретного режима
  const handleSetMode = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem(THEME_MODE_KEY, newMode);
  };
  
  // Создание темы на основе текущего режима
  const theme = createAppTheme(mode);
  
  // Значение контекста
  const contextValue: ThemeContextType = {
    mode,
    toggleTheme,
    setMode: handleSetMode
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Алиас для обратной совместимости со сторибуками
export const ThemeModeProvider = ThemeProvider;

/**
 * Хук для использования темы в компонентах
 */
export const useThemeMode = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  
  return context;
};

export default ThemeProvider;