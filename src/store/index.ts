import { configureStore } from '@reduxjs/toolkit';
import { 
  baseApi,
  partnersApi,
  regionsApi,
  citiesApi,
  servicePointsApi,
  servicesApi,
  bookingsApi,
  reviewsApi,
  usersApi,
  authApi
} from '../api';
import { authReducer } from './authSlice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      baseApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 