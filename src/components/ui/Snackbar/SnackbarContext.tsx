import React, { createContext, useContext, useCallback, useState } from 'react';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { SnackbarContextValue, SnackbarMessage, SnackbarMessageType, SnackbarPosition } from './types';
import Snackbar from './Snackbar';

// Создаем контекст
const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

// Значения по умолчанию
const DEFAULT_AUTO_HIDE_DURATION = 6000;
const DEFAULT_POSITION: SnackbarPosition = {
  vertical: 'bottom',
  horizontal: 'center'
};

/**
 * Провайдер для управления уведомлениями
 */
export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Состояние для хранения очереди сообщений
  const [messages, setMessages] = useState<SnackbarMessage[]>([]);

  // Функция для добавления сообщения в очередь
  const addMessage = useCallback((
    message: string,
    type: SnackbarMessageType = 'info',
    duration: number = DEFAULT_AUTO_HIDE_DURATION,
    position: SnackbarPosition = DEFAULT_POSITION
  ) => {
    setMessages(prev => [...prev, {
      id: uuidv4(),
      message,
      type,
      autoHideDuration: duration,
      position,
    }]);
  }, []);

  // Функция для удаления сообщения из очереди
  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  // Хелперы для разных типов сообщений
  const showSuccess = useCallback((
    message: string,
    duration?: number,
    position: SnackbarPosition = DEFAULT_POSITION
  ) => {
    addMessage(message, 'success', duration, position);
  }, [addMessage]);

  const showError = useCallback((
    message: string,
    duration?: number,
    position: SnackbarPosition = DEFAULT_POSITION
  ) => {
    addMessage(message, 'error', duration, position);
  }, [addMessage]);

  const showWarning = useCallback((
    message: string,
    duration?: number,
    position: SnackbarPosition = DEFAULT_POSITION
  ) => {
    addMessage(message, 'warning', duration, position);
  }, [addMessage]);

  const showInfo = useCallback((
    message: string,
    duration?: number,
    position: SnackbarPosition = DEFAULT_POSITION
  ) => {
    addMessage(message, 'info', duration, position);
  }, [addMessage]);

  // Значение контекста
  const contextValue: SnackbarContextValue = {
    showMessage: addMessage,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
      {/* Отображаем только первое сообщение из очереди */}
      {messages[0] && (
        <Snackbar
          open={true}
          message={messages[0].message}
          severity={messages[0].type}
          onClose={() => removeMessage(messages[0].id)}
          anchorOrigin={messages[0].position || DEFAULT_POSITION}
          autoHideDuration={messages[0].autoHideDuration || DEFAULT_AUTO_HIDE_DURATION}
        />
      )}
    </SnackbarContext.Provider>
  );
};

/**
 * Хук для использования уведомлений
 */
export const useSnackbar = (): SnackbarContextValue => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar должен использоваться внутри SnackbarProvider');
  }
  return context;
}; 