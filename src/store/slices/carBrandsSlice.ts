import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CarBrand, CarBrandsState } from '../../types';
import { carBrandsApi } from '../../api';
import { CarBrandCreateRequest, CarBrandUpdateRequest } from '../../types/apiResponses';

// Начальное состояние
const initialState: CarBrandsState = {
  carBrands: [],
  selectedCarBrand: null,
  loading: false,
  error: null,
  totalItems: 0,
};

type CreateBrandPayload = CarBrandCreateRequest['car_brand'];
type UpdateBrandPayload = {
  id: number;
  data: Partial<CreateBrandPayload>;
};

// Асинхронные экшены
export const fetchCarBrands = createAsyncThunk(
  'carBrands/fetchCarBrands',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await carBrandsApi.endpoints.getCarBrands.initiate(params);
      if ('error' in response) {
        return rejectWithValue('Не удалось загрузить бренды автомобилей');
      }
      return {
        carBrands: response.data.data,
        totalItems: response.data.pagination.total_count,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось загрузить бренды автомобилей');
    }
  }
);

export const fetchCarBrandById = createAsyncThunk(
  'carBrands/fetchCarBrandById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await carBrandsApi.endpoints.getCarBrand.initiate(id);
      if ('error' in response) {
        return rejectWithValue('Не удалось найти бренд автомобиля');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось найти бренд автомобиля');
    }
  }
);

export const createCarBrand = createAsyncThunk(
  'carBrands/createCarBrand',
  async (data: CreateBrandPayload, { rejectWithValue }) => {
    try {
      const response = await carBrandsApi.endpoints.createCarBrand.initiate(data);
      if ('error' in response) {
        return rejectWithValue('Не удалось создать бренд автомобиля');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось создать бренд автомобиля');
    }
  }
);

export const updateCarBrand = createAsyncThunk(
  'carBrands/updateCarBrand',
  async ({ id, data }: UpdateBrandPayload, { rejectWithValue }) => {
    try {
      const response = await carBrandsApi.endpoints.updateCarBrand.initiate({ id, data });
      if ('error' in response) {
        return rejectWithValue('Не удалось обновить бренд автомобиля');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось обновить бренд автомобиля');
    }
  }
);

export const deleteCarBrand = createAsyncThunk(
  'carBrands/deleteCarBrand',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await carBrandsApi.endpoints.deleteCarBrand.initiate(id);
      if ('error' in response) {
        return rejectWithValue('Не удалось удалить бренд автомобиля');
      }
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось удалить бренд автомобиля');
    }
  }
);

// Редьюсер
const carBrandsSlice = createSlice({
  name: 'carBrands',
  initialState,
  reducers: {
    clearSelectedCarBrand: (state) => {
      state.selectedCarBrand = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchCarBrands
      .addCase(fetchCarBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCarBrands.fulfilled, (state, action: PayloadAction<{ carBrands: CarBrand[]; totalItems: number }>) => {
        state.loading = false;
        state.carBrands = action.payload.carBrands;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(fetchCarBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка fetchCarBrandById
      .addCase(fetchCarBrandById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCarBrandById.fulfilled, (state, action: PayloadAction<CarBrand>) => {
        state.loading = false;
        state.selectedCarBrand = action.payload;
      })
      .addCase(fetchCarBrandById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка createCarBrand
      .addCase(createCarBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCarBrand.fulfilled, (state, action: PayloadAction<CarBrand>) => {
        state.loading = false;
        state.carBrands.push(action.payload);
        state.totalItems += 1;
      })
      .addCase(createCarBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка updateCarBrand
      .addCase(updateCarBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCarBrand.fulfilled, (state, action: PayloadAction<CarBrand>) => {
        state.loading = false;
        const index = state.carBrands.findIndex(brand => brand.id === action.payload.id);
        if (index !== -1) {
          state.carBrands[index] = action.payload;
        }
        if (state.selectedCarBrand?.id === action.payload.id) {
          state.selectedCarBrand = action.payload;
        }
      })
      .addCase(updateCarBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка deleteCarBrand
      .addCase(deleteCarBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCarBrand.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.carBrands = state.carBrands.filter(brand => brand.id !== action.payload);
        state.totalItems -= 1;
        if (state.selectedCarBrand?.id === action.payload) {
          state.selectedCarBrand = null;
        }
      })
      .addCase(deleteCarBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedCarBrand, clearError } = carBrandsSlice.actions;
export default carBrandsSlice.reducer;