import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import partnersReducer from './slices/partnersSlice';
import servicePointsReducer from './slices/servicePointsSlice';
import usersReducer from './slices/usersSlice';
import regionsReducer from './slices/regionsSlice';
import citiesReducer from './slices/citiesSlice';
import carBrandsReducer from './slices/carBrandsSlice';
import carModelsReducer from './slices/carModelsSlice';
import clientsReducer from './slices/clientsSlice';
import bookingsReducer from './slices/bookingsSlice';
import servicesReducer from './slices/servicesSlice';
import dashboardReducer from './slices/dashboardSlice';
import { partnersApi } from '../api/partners';
import { regionsApi } from '../api/regions';
import { citiesApi } from '../api/cities';
import { servicePointsApi } from '../api/servicePoints';
import { clientsApi } from '../api/clients';
import { carBrandsApi } from '../api/carBrands';
import { carModelsApi } from '../api/carModels';
import { bookingsApi } from '../api/bookings';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    partners: partnersReducer,
    servicePoints: servicePointsReducer,
    users: usersReducer,
    regions: regionsReducer,
    cities: citiesReducer,
    carBrands: carBrandsReducer,
    carModels: carModelsReducer,
    clients: clientsReducer,
    bookings: bookingsReducer,
    services: servicesReducer,
    dashboard: dashboardReducer,
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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 