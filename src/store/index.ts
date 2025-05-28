import { configureStore } from '@reduxjs/toolkit';
import { 
  baseApi,
  usersApi
} from '../api';
import { authReducer } from './authSlice';

export const store = configureStore({
  reducer: {
    // Базовый API (включает в себя все injected endpoints)
    [baseApi.reducerPath]: baseApi.reducer,
    
    // Отдельные API
    [usersApi.reducerPath]: usersApi.reducer,
    
    // Обычные reducers
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      baseApi.middleware,
      usersApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 