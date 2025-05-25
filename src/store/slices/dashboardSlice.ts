import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { dashboardApi, DashboardStats } from '../../api/dashboard';

// Интерфейс состояния дашборда
export interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

// Начальное состояние
const initialState: DashboardState = {
  stats: null,
  loading: false,
  error: null,
};

// Асинхронные экшены
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching dashboard stats...');
      const response = await dashboardApi.getStats();
      console.log('Dashboard API response:', response);
      console.log('Dashboard data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      return rejectWithValue(error.response?.data?.error || 'Не удалось загрузить статистику дашборда');
    }
  }
);

// Редьюсер
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchDashboardStats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardStats>) => {
        console.log('Dashboard stats fulfilled:', action.payload);
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer; 