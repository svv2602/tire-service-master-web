import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import {
  partnersApi,
  citiesApi,
  regionsApi,
  bookingsApi,
  clientsApi,
  servicePointsApi,
  carBrandsApi,
  carModelsApi,
  dashboardApi,
  authApi,
  usersApi,
  tireTypesApi,
  carTypesApi,
  reviewsApi,
  scheduleApi,
  serviceCategoriesApi,
  servicePointPhotosApi,
  servicePointServicesApi,
} from '../api';

import authReducer from './slices/authSlice';
import partnersReducer from './slices/partnersSlice';
import servicePointsReducer from './slices/servicePointsSlice';
import regionsReducer from './slices/regionsSlice';
import citiesReducer from './slices/citiesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    partners: partnersReducer,
    servicePoints: servicePointsReducer,
    regions: regionsReducer,
    cities: citiesReducer,
    [partnersApi.reducerPath]: partnersApi.reducer,
    [citiesApi.reducerPath]: citiesApi.reducer,
    [regionsApi.reducerPath]: regionsApi.reducer,
    [bookingsApi.reducerPath]: bookingsApi.reducer,
    [clientsApi.reducerPath]: clientsApi.reducer,
    [servicePointsApi.reducerPath]: servicePointsApi.reducer,
    [carBrandsApi.reducerPath]: carBrandsApi.reducer,
    [carModelsApi.reducerPath]: carModelsApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [tireTypesApi.reducerPath]: tireTypesApi.reducer,
    [carTypesApi.reducerPath]: carTypesApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
    [serviceCategoriesApi.reducerPath]: serviceCategoriesApi.reducer,
    [scheduleApi.reducerPath]: scheduleApi.reducer,
    [servicePointServicesApi.reducerPath]: servicePointServicesApi.reducer,
    [servicePointPhotosApi.reducerPath]: servicePointPhotosApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      partnersApi.middleware,
      citiesApi.middleware,
      regionsApi.middleware,
      bookingsApi.middleware,
      clientsApi.middleware,
      servicePointsApi.middleware,
      carBrandsApi.middleware,
      carModelsApi.middleware,
      dashboardApi.middleware,
      authApi.middleware,
      usersApi.middleware,
      tireTypesApi.middleware,
      carTypesApi.middleware,
      reviewsApi.middleware,
      scheduleApi.middleware,
      serviceCategoriesApi.middleware,
      servicePointPhotosApi.middleware,
      servicePointServicesApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 