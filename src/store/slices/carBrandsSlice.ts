import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CarBrand } from '../../types';
import { carBrandsApi } from '../../api/api';

interface CarBrandsState {
  carBrands: CarBrand[];
  selectedCarBrand: CarBrand | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
}

// Начальное состояние
const initialState: CarBrandsState = {
  carBrands: [],
  selectedCarBrand: null,
  loading: false,
  error: null,
  totalItems: 0,
};

// Асинхронные экшены
export const fetchCarBrands = createAsyncThunk(
  'carBrands/fetchCarBrands',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await carBrandsApi.getAll(params);
      return {
        carBrands: response.data.car_brands,
        totalItems: response.data.total_items || response.data.car_brands.length,
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
      const response = await carBrandsApi.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось найти бренд автомобиля');
    }
  }
);

export const createCarBrand = createAsyncThunk(
  'carBrands/createCarBrand',
  async (data: { name: string; logo?: string; is_active?: boolean }, { rejectWithValue }) => {
    try {
      const response = await carBrandsApi.create({ car_brand: data });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось создать бренд автомобиля');
    }
  }
);

export const updateCarBrand = createAsyncThunk(
  'carBrands/updateCarBrand',
  async ({ id, data }: { id: number; data: { name?: string; logo?: string; is_active?: boolean } }, { rejectWithValue }) => {
    try {
      const response = await carBrandsApi.update(id, { car_brand: data });
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
      await carBrandsApi.delete(id);
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