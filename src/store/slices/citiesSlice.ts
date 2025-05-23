import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { citiesApi, CityResponse, CitiesResponse, City } from '../../api/cities';

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
      const response = await citiesApi.getAll(params);
      return response.data as CitiesResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось загрузить города');
    }
  }
);

export const fetchCityById = createAsyncThunk(
  'cities/fetchCityById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await citiesApi.getById(id);
      return response.data as CityResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось найти город');
    }
  }
);

export const createCity = createAsyncThunk(
  'cities/createCity',
  async (data: { name: string; region_id: number; is_active: boolean }, { rejectWithValue }) => {
    try {
      const response = await citiesApi.create(data);
      return response.data as CityResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось создать город');
    }
  }
);

export const updateCity = createAsyncThunk(
  'cities/updateCity',
  async ({ id, data }: { id: number; data: { name?: string; region_id?: number; is_active?: boolean } }, { rejectWithValue }) => {
    try {
      const response = await citiesApi.update(id, data);
      return response.data as CityResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось обновить город');
    }
  }
);

export const deleteCity = createAsyncThunk(
  'cities/deleteCity',
  async (id: number, { rejectWithValue }) => {
    try {
      await citiesApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось удалить город');
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
      .addCase(fetchCities.fulfilled, (state, action: PayloadAction<CitiesResponse>) => {
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
      .addCase(fetchCityById.fulfilled, (state, action: PayloadAction<CityResponse>) => {
        state.loading = false;
        state.selectedCity = action.payload.city;
      })
      .addCase(fetchCityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка createCity
      .addCase(createCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCity.fulfilled, (state, action: PayloadAction<CityResponse>) => {
        state.loading = false;
        state.cities.push(action.payload.city);
        state.totalItems += 1;
      })
      .addCase(createCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка updateCity
      .addCase(updateCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCity.fulfilled, (state, action: PayloadAction<CityResponse>) => {
        state.loading = false;
        const index = state.cities.findIndex(city => city.id === action.payload.city.id);
        if (index !== -1) {
          state.cities[index] = action.payload.city;
        }
        if (state.selectedCity?.id === action.payload.city.id) {
          state.selectedCity = action.payload.city;
        }
      })
      .addCase(updateCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка deleteCity
      .addCase(deleteCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCity.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.cities = state.cities.filter(city => city.id !== action.payload);
        state.totalItems -= 1;
        if (state.selectedCity?.id === action.payload) {
          state.selectedCity = null;
        }
      })
      .addCase(deleteCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedCity, clearError } = citiesSlice.actions;
export default citiesSlice.reducer;