import { configureStore } from '@reduxjs/toolkit';
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