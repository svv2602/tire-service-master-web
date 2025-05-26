import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Region } from '../../types';
import { regionsApi } from '../../api/regions';

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
      const regions = await regionsApi.getAll();
      return {
        regions: regions,
        total_items: regions.length,
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
      const region = await regionsApi.getById(id);
      return region;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось найти регион');
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
      });
  },
});

export const { clearSelectedRegion, clearError } = regionsSlice.actions;
export default regionsSlice.reducer; 