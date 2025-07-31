import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { baseApi } from '../api';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    // Базовый API (включает в себя все injected endpoints, включая users)
    [baseApi.reducerPath]: baseApi.reducer,
    
    // Обычные reducers
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      baseApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Типизированные хуки для использования в компонентах
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 