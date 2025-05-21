import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ServicePoint, ServicePointsState } from '../../types';
import { servicePointsApi } from '../../api/api';

// Начальное состояние
const initialState: ServicePointsState = {
  servicePoints: [],
  selectedServicePoint: null,
  loading: false,
  error: null,
  totalItems: 0,
};

// Асинхронные экшены
export const fetchServicePoints = createAsyncThunk(
  'servicePoints/fetchServicePoints',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await servicePointsApi.getAll(params);
      console.log('API Response:', response.data);
      
      // Обрабатываем ответ API в формате { data: [...], pagination: {...} }
      let servicePoints = [];
      let totalItems = 0;
      
      if (response.data.data && Array.isArray(response.data.data)) {
        // Стандартная структура ответа API
        servicePoints = response.data.data;
        totalItems = response.data.pagination?.total_count || 0;
      } else if (Array.isArray(response.data)) {
        // Если API вернул просто массив
        servicePoints = response.data;
        totalItems = servicePoints.length;
      } else {
        console.warn('Unexpected API response format:', response.data);
        // Если формат не распознан, возвращаем пустой массив
        servicePoints = [];
        totalItems = 0;
      }
      
      return {
        servicePoints,
        totalItems,
      };
    } catch (error: any) {
      console.error('Error fetching service points:', error);
      return rejectWithValue(error.response?.data?.error || 'Не удалось загрузить точки обслуживания');
    }
  }
);

export const fetchServicePointById = createAsyncThunk(
  'servicePoints/fetchServicePointById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await servicePointsApi.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось найти точку обслуживания');
    }
  }
);

export const createServicePoint = createAsyncThunk(
  'servicePoints/createServicePoint',
  async ({ partnerId, data }: { partnerId: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await servicePointsApi.create(partnerId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось создать точку обслуживания');
    }
  }
);

export const updateServicePoint = createAsyncThunk(
  'servicePoints/updateServicePoint',
  async ({ partnerId, id, data }: { partnerId: number; id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await servicePointsApi.update(partnerId, id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось обновить точку обслуживания');
    }
  }
);

export const deleteServicePoint = createAsyncThunk(
  'servicePoints/deleteServicePoint',
  async ({ partnerId, id }: { partnerId: number; id: number }, { rejectWithValue }) => {
    try {
      await servicePointsApi.delete(partnerId, id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось удалить точку обслуживания');
    }
  }
);

export const fetchServicePointPhotos = createAsyncThunk(
  'servicePoints/fetchServicePointPhotos',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await servicePointsApi.getPhotos(id);
      return {
        servicePointId: id,
        photos: response.data.photos,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось загрузить фотографии');
    }
  }
);

export const uploadServicePointPhoto = createAsyncThunk(
  'servicePoints/uploadServicePointPhoto',
  async ({ id, photoData }: { id: number; photoData: FormData }, { rejectWithValue }) => {
    try {
      const response = await servicePointsApi.uploadPhoto(id, photoData);
      return {
        servicePointId: id,
        photo: response.data.photo,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось загрузить фотографию');
    }
  }
);

export const deleteServicePointPhoto = createAsyncThunk(
  'servicePoints/deleteServicePointPhoto',
  async ({ servicePointId, photoId }: { servicePointId: number; photoId: number }, { rejectWithValue }) => {
    try {
      await servicePointsApi.deletePhoto(servicePointId, photoId);
      return {
        servicePointId,
        photoId,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось удалить фотографию');
    }
  }
);

// Редьюсер
const servicePointsSlice = createSlice({
  name: 'servicePoints',
  initialState,
  reducers: {
    clearSelectedServicePoint: (state) => {
      state.selectedServicePoint = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchServicePoints
      .addCase(fetchServicePoints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServicePoints.fulfilled, (state, action: PayloadAction<{ servicePoints: ServicePoint[]; totalItems: number }>) => {
        state.loading = false;
        state.servicePoints = action.payload.servicePoints;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(fetchServicePoints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка fetchServicePointById
      .addCase(fetchServicePointById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServicePointById.fulfilled, (state, action: PayloadAction<ServicePoint>) => {
        state.loading = false;
        state.selectedServicePoint = action.payload;
      })
      .addCase(fetchServicePointById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка createServicePoint
      .addCase(createServicePoint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createServicePoint.fulfilled, (state, action: PayloadAction<ServicePoint>) => {
        state.loading = false;
        state.servicePoints.push(action.payload);
        state.totalItems += 1;
      })
      .addCase(createServicePoint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка updateServicePoint
      .addCase(updateServicePoint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateServicePoint.fulfilled, (state, action: PayloadAction<ServicePoint>) => {
        state.loading = false;
        const index = state.servicePoints.findIndex(point => point.id === action.payload.id);
        if (index !== -1) {
          state.servicePoints[index] = action.payload;
        }
        if (state.selectedServicePoint?.id === action.payload.id) {
          state.selectedServicePoint = action.payload;
        }
      })
      .addCase(updateServicePoint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка deleteServicePoint
      .addCase(deleteServicePoint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteServicePoint.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.servicePoints = state.servicePoints.filter(point => point.id !== action.payload);
        state.totalItems -= 1;
        if (state.selectedServicePoint?.id === action.payload) {
          state.selectedServicePoint = null;
        }
      })
      .addCase(deleteServicePoint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка фотографий
      .addCase(fetchServicePointPhotos.fulfilled, (state, action: PayloadAction<{ servicePointId: number; photos: any[] }>) => {
        if (state.selectedServicePoint?.id === action.payload.servicePointId) {
          state.selectedServicePoint = {
            ...state.selectedServicePoint,
            photos: action.payload.photos,
          };
        }
      })
      .addCase(uploadServicePointPhoto.fulfilled, (state, action: PayloadAction<{ servicePointId: number; photo: any }>) => {
        if (state.selectedServicePoint?.id === action.payload.servicePointId) {
          const photos = state.selectedServicePoint.photos || [];
          state.selectedServicePoint = {
            ...state.selectedServicePoint,
            photos: [...photos, action.payload.photo],
          };
        }
      })
      .addCase(deleteServicePointPhoto.fulfilled, (state, action: PayloadAction<{ servicePointId: number; photoId: number }>) => {
        if (state.selectedServicePoint?.id === action.payload.servicePointId && state.selectedServicePoint.photos) {
          state.selectedServicePoint = {
            ...state.selectedServicePoint,
            photos: state.selectedServicePoint.photos.filter(photo => photo.id !== action.payload.photoId),
          };
        }
      });
  },
});

export const { clearSelectedServicePoint, clearError } = servicePointsSlice.actions;
export default servicePointsSlice.reducer; 