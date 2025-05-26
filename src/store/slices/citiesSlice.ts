import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { City } from '../../types';
import { citiesApi } from '../../api/cities';

interface CitiesState {
  cities: City[];
  selectedCity: City | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
}

// Начальное состояние
const initialState: CitiesState = {
  cities: [],
  selectedCity: null,
  loading: false,
  error: null,
  totalItems: 0,
};

// Асинхронные экшены
export const fetchCities = createAsyncThunk(
  'cities/fetchCities',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const cities = await citiesApi.getAll(params.region_id);
      return {
        cities: cities,
        total_items: cities.length,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось загрузить города');
    }
  }
);

export const fetchCityById = createAsyncThunk(
  'cities/fetchCityById',
  async (id: number, { rejectWithValue }) => {
    try {
      const city = await citiesApi.getById(id);
      return city;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось найти город');
    }
  }
);

// Редьюсер
const citiesSlice = createSlice({
  name: 'cities',
  initialState,
  reducers: {
    clearSelectedCity: (state) => {
      state.selectedCity = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchCities
      .addCase(fetchCities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCities.fulfilled, (state, action: PayloadAction<{ cities: City[]; total_items: number }>) => {
        state.loading = false;
        state.cities = action.payload.cities;
        state.totalItems = action.payload.total_items;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка fetchCityById
      .addCase(fetchCityById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCityById.fulfilled, (state, action: PayloadAction<City>) => {
        state.loading = false;
        state.selectedCity = action.payload;
      })
      .addCase(fetchCityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedCity, clearError } = citiesSlice.actions;
export default citiesSlice.reducer;