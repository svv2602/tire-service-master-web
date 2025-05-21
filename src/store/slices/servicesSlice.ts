import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Service, ServiceCategory } from '../../types';
import { referencesApi } from '../../api/api';

interface ServicesState {
  services: Service[];
  selectedService: Service | null;
  serviceCategories: ServiceCategory[];
  loading: boolean;
  error: string | null;
  totalItems: number;
}

// Начальное состояние
const initialState: ServicesState = {
  services: [],
  selectedService: null,
  serviceCategories: [],
  loading: false,
  error: null,
  totalItems: 0,
};

// Асинхронные экшены
export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await referencesApi.getServices(params);
      
      // Обрабатываем ответ API в зависимости от формата
      let services = [];
      let totalItems = 0;
      
      if (response.data.data && Array.isArray(response.data.data)) {
        // Стандартная структура ответа API
        services = response.data.data;
        totalItems = response.data.pagination?.total_count || 0;
      } else if (response.data.services && Array.isArray(response.data.services)) {
        // Альтернативная структура
        services = response.data.services;
        totalItems = response.data.total_items || services.length;
      } else if (Array.isArray(response.data)) {
        // Просто массив
        services = response.data;
        totalItems = services.length;
      } else {
        console.warn('Unexpected API response format:', response.data);
        services = [];
        totalItems = 0;
      }
      
      return {
        services,
        totalItems,
      };
    } catch (error: any) {
      console.error('Error fetching services:', error);
      return rejectWithValue(error.response?.data?.error || 'Не удалось загрузить услуги');
    }
  }
);

export const fetchServiceById = createAsyncThunk(
  'services/fetchServiceById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await referencesApi.getServiceById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось найти услугу');
    }
  }
);

export const fetchServiceCategories = createAsyncThunk(
  'services/fetchServiceCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await referencesApi.getServiceCategories();
      
      // Обрабатываем ответ API в зависимости от формата
      let categories = [];
      
      if (response.data.data && Array.isArray(response.data.data)) {
        categories = response.data.data;
      } else if (response.data.categories && Array.isArray(response.data.categories)) {
        categories = response.data.categories;
      } else if (Array.isArray(response.data)) {
        categories = response.data;
      } else {
        console.warn('Unexpected API response format:', response.data);
        categories = [];
      }
      
      return categories;
    } catch (error: any) {
      console.error('Error fetching service categories:', error);
      return rejectWithValue(error.response?.data?.error || 'Не удалось загрузить категории услуг');
    }
  }
);

// Редьюсер
const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearSelectedService: (state) => {
      state.selectedService = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchServices
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action: PayloadAction<{ services: Service[]; totalItems: number }>) => {
        state.loading = false;
        state.services = action.payload.services;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка fetchServiceById
      .addCase(fetchServiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action: PayloadAction<Service>) => {
        state.loading = false;
        state.selectedService = action.payload;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка fetchServiceCategories
      .addCase(fetchServiceCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceCategories.fulfilled, (state, action: PayloadAction<ServiceCategory[]>) => {
        state.loading = false;
        state.serviceCategories = action.payload;
      })
      .addCase(fetchServiceCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedService, clearError } = servicesSlice.actions;
export default servicesSlice.reducer; 