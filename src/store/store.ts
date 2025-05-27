import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import authReducer from './slices/authSlice';

// Настраиваем Redux store
export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

// Типы для TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 