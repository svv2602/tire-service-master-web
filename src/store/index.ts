import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import partnersReducer from './slices/partnersSlice';
import servicePointsReducer from './slices/servicePointsSlice';
import usersReducer from './slices/usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    partners: partnersReducer,
    servicePoints: servicePointsReducer,
    users: usersReducer,
    // Здесь будут добавлены другие редьюсеры при необходимости
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>; 