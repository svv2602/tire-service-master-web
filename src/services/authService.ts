import { Dispatch } from '@reduxjs/toolkit';
import { logout } from '../store/slices/authSlice';

// Функция для обработки выхода из системы
export const handleLogout = (dispatch: Dispatch) => {
  dispatch(logout());
};

// Функция для обновления токена
export const refreshTokens = async (apiClient: any) => {
  const response = await apiClient.post('/auth/refresh', null, {
    withCredentials: true // Важно для отправки куки
  });
  return response.data;
}; 