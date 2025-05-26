import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CarModel, CarModelsState } from '../../types';
import { carModelsApi } from '../../api';
import { CarModelFormData } from '../../api/carModels';

// Начальное состояние
const initialState: CarModelsState = {
  carModels: [],
  selectedCarModel: null,
  loading: false,
  error: null,
  totalItems: 0,
};

type CreateModelPayload = CarModelFormData;
type UpdateModelPayload = {
  id: number;
  data: Partial<CreateModelPayload>;
};

// Асинхронные экшены
export const fetchCarModels = createAsyncThunk(
  'carModels/fetchCarModels',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await carModelsApi.endpoints.getCarModels.initiate(params);
      if ('error' in response) {
        return rejectWithValue('Не удалось загрузить модели автомобилей');
      }
      return {
        carModels: response.data.data,
        totalItems: response.data.pagination.total_count,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось загрузить модели автомобилей');
    }
  }
);

export const fetchCarModelById = createAsyncThunk(
  'carModels/fetchCarModelById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await carModelsApi.endpoints.getCarModel.initiate(id);
      if ('error' in response) {
        return rejectWithValue('Не удалось найти модель автомобиля');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось найти модель автомобиля');
    }
  }
);

export const createCarModel = createAsyncThunk(
  'carModels/createCarModel',
  async (data: CreateModelPayload, { rejectWithValue }) => {
    try {
      const response = await carModelsApi.endpoints.createCarModel.initiate(data);
      if ('error' in response) {
        return rejectWithValue('Не удалось создать модель автомобиля');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось создать модель автомобиля');
    }
  }
);

export const updateCarModel = createAsyncThunk(
  'carModels/updateCarModel',
  async ({ id, data }: UpdateModelPayload, { rejectWithValue }) => {
    try {
      const response = await carModelsApi.endpoints.updateCarModel.initiate({ id, data });
      if ('error' in response) {
        return rejectWithValue('Не удалось обновить модель автомобиля');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось обновить модель автомобиля');
    }
  }
);

export const deleteCarModel = createAsyncThunk(
  'carModels/deleteCarModel',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await carModelsApi.endpoints.deleteCarModel.initiate(id);
      if ('error' in response) {
        return rejectWithValue('Не удалось удалить модель автомобиля');
      }
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось удалить модель автомобиля');
    }
  }
);

// Редьюсер
const carModelsSlice = createSlice({
  name: 'carModels',
  initialState,
  reducers: {
    clearSelectedCarModel: (state) => {
      state.selectedCarModel = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchCarModels
      .addCase(fetchCarModels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCarModels.fulfilled, (state, action: PayloadAction<{ carModels: CarModel[]; totalItems: number }>) => {
        state.loading = false;
        state.carModels = action.payload.carModels;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(fetchCarModels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка fetchCarModelById
      .addCase(fetchCarModelById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCarModelById.fulfilled, (state, action: PayloadAction<CarModel>) => {
        state.loading = false;
        state.selectedCarModel = action.payload;
      })
      .addCase(fetchCarModelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка createCarModel
      .addCase(createCarModel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCarModel.fulfilled, (state, action: PayloadAction<CarModel>) => {
        state.loading = false;
        state.carModels.push(action.payload);
        state.totalItems += 1;
      })
      .addCase(createCarModel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка updateCarModel
      .addCase(updateCarModel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCarModel.fulfilled, (state, action: PayloadAction<CarModel>) => {
        state.loading = false;
        const index = state.carModels.findIndex(model => model.id === action.payload.id);
        if (index !== -1) {
          state.carModels[index] = action.payload;
        }
        if (state.selectedCarModel?.id === action.payload.id) {
          state.selectedCarModel = action.payload;
        }
      })
      .addCase(updateCarModel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка deleteCarModel
      .addCase(deleteCarModel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCarModel.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.carModels = state.carModels.filter(model => model.id !== action.payload);
        state.totalItems -= 1;
        if (state.selectedCarModel?.id === action.payload) {
          state.selectedCarModel = null;
        }
      })
      .addCase(deleteCarModel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedCarModel, clearError } = carModelsSlice.actions;
export default carModelsSlice.reducer;