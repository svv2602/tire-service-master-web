import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Region } from '../../types';
import { regionsApi, RegionResponse, RegionsResponse } from '../../api/regions';

interface RegionsState {
  regions: Region[];
  selectedRegion: Region | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
}

// Начальное состояние
const initialState: RegionsState = {
  regions: [],
  selectedRegion: null,
  loading: false,
  error: null,
  totalItems: 0,
};

// Асинхронные экшены
export const fetchRegions = createAsyncThunk(
  'regions/fetchRegions',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await regionsApi.getAll(params);
      const data = response.data as RegionsResponse;
      return {
        regions: data.regions,
        total_items: data.total_items,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось загрузить регионы');
    }
  }
);

export const fetchRegionById = createAsyncThunk(
  'regions/fetchRegionById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await regionsApi.getById(id);
      return response.data.region;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось найти регион');
    }
  }
);

export const createRegion = createAsyncThunk(
  'regions/createRegion',
  async (data: { name: string; code?: string; is_active: boolean }, { rejectWithValue }) => {
    try {
      const response = await regionsApi.create(data);
      return response.data.region;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось создать регион');
    }
  }
);

export const updateRegion = createAsyncThunk(
  'regions/updateRegion',
  async ({ id, data }: { id: number; data: { name?: string; code?: string; is_active: boolean } }, { rejectWithValue }) => {
    try {
      const response = await regionsApi.update(id, data);
      return response.data.region;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось обновить регион');
    }
  }
);

export const deleteRegion = createAsyncThunk(
  'regions/deleteRegion',
  async (id: number, { rejectWithValue }) => {
    try {
      await regionsApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось удалить регион');
    }
  }
);

// Редьюсер
const regionsSlice = createSlice({
  name: 'regions',
  initialState,
  reducers: {
    clearSelectedRegion: (state) => {
      state.selectedRegion = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchRegions
      .addCase(fetchRegions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegions.fulfilled, (state, action: PayloadAction<{ regions: Region[]; total_items: number }>) => {
        state.loading = false;
        state.regions = action.payload.regions;
        state.totalItems = action.payload.total_items;
      })
      .addCase(fetchRegions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка fetchRegionById
      .addCase(fetchRegionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegionById.fulfilled, (state, action: PayloadAction<Region>) => {
        state.loading = false;
        state.selectedRegion = action.payload;
      })
      .addCase(fetchRegionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка createRegion
      .addCase(createRegion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRegion.fulfilled, (state, action: PayloadAction<Region>) => {
        state.loading = false;
        state.regions.push(action.payload);
        state.totalItems += 1;
      })
      .addCase(createRegion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка updateRegion
      .addCase(updateRegion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRegion.fulfilled, (state, action: PayloadAction<Region>) => {
        state.loading = false;
        const index = state.regions.findIndex(region => region.id === action.payload.id);
        if (index !== -1) {
          state.regions[index] = action.payload;
        }
        if (state.selectedRegion?.id === action.payload.id) {
          state.selectedRegion = action.payload;
        }
      })
      .addCase(updateRegion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка deleteRegion
      .addCase(deleteRegion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRegion.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.regions = state.regions.filter(region => region.id !== action.payload);
        state.totalItems -= 1;
        if (state.selectedRegion?.id === action.payload) {
          state.selectedRegion = null;
        }
      })
      .addCase(deleteRegion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedRegion, clearError } = regionsSlice.actions;
export default regionsSlice.reducer; 