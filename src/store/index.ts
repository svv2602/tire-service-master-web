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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 