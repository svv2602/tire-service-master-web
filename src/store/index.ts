import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { bookingsApi } from '../api/bookings';
import { carBrandsApi } from '../api/carBrands';
import { carModelsApi } from '../api/carModels';
import { servicePointsApi } from '../api/service-points';
import authReducer from './slices/authSlice';
import {
  partnersApi,
  regionsApi,
  citiesApi,
  clientsApi,
} from '../api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [partnersApi.reducerPath]: partnersApi.reducer,
    [regionsApi.reducerPath]: regionsApi.reducer,
    [citiesApi.reducerPath]: citiesApi.reducer,
    [servicePointsApi.reducerPath]: servicePointsApi.reducer,
    [clientsApi.reducerPath]: clientsApi.reducer,
    [carBrandsApi.reducerPath]: carBrandsApi.reducer,
    [carModelsApi.reducerPath]: carModelsApi.reducer,
    [bookingsApi.reducerPath]: bookingsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      partnersApi.middleware,
      regionsApi.middleware,
      citiesApi.middleware,
      servicePointsApi.middleware,
      clientsApi.middleware,
      carBrandsApi.middleware,
      carModelsApi.middleware,
      bookingsApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 