import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Booking, BookingsState } from '../../types';
import { bookingsApi } from '../../api/api';

// Начальное состояние
const initialState: BookingsState = {
  bookings: [],
  selectedBooking: null,
  loading: false,
  error: null,
  totalItems: 0,
};

// Асинхронные экшены
export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      // Определить, какой запрос выполнять в зависимости от параметров
      let response;
      if (params.clientId) {
        response = await bookingsApi.getClientBookings(params.clientId, params);
      } else if (params.servicePointId) {
        response = await bookingsApi.getServicePointBookings(params.servicePointId, params);
      } else {
        // Предполагаем, что есть метод getAll для общего списка бронирований
        response = await bookingsApi.getAll(params);
      }
      
      console.log('API Response:', response.data);
      
      // Обрабатываем ответ API в формате { data: [...], pagination: {...} }
      let bookings = [];
      let totalItems = 0;
      
      if (response.data.data && Array.isArray(response.data.data)) {
        // Стандартная структура ответа API
        bookings = response.data.data;
        totalItems = response.data.pagination?.total_count || 0;
      } else if (Array.isArray(response.data)) {
        // Если API вернул просто массив
        bookings = response.data;
        totalItems = bookings.length;
      } else {
        console.warn('Unexpected API response format:', response.data);
        // Если формат не распознан, возвращаем пустой массив
        bookings = [];
        totalItems = 0;
      }
      
      return {
        bookings,
        totalItems,
      };
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      return rejectWithValue(error.response?.data?.error || 'Не удалось загрузить бронирования');
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  'bookings/fetchBookingById',
  async ({ clientId, bookingId }: { clientId: number; bookingId: number }, { rejectWithValue }) => {
    try {
      const response = await bookingsApi.getById(clientId, bookingId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось найти бронирование');
    }
  }
);

export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async ({ clientId, data }: { clientId: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await bookingsApi.create(clientId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось создать бронирование');
    }
  }
);

export const updateBooking = createAsyncThunk(
  'bookings/updateBooking',
  async ({ clientId, bookingId, data }: { clientId: number; bookingId: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await bookingsApi.update(clientId, bookingId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось обновить бронирование');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async (bookingId: number, { rejectWithValue }) => {
    try {
      const response = await bookingsApi.cancel(bookingId);
      return { bookingId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось отменить бронирование');
    }
  }
);

export const confirmBooking = createAsyncThunk(
  'bookings/confirmBooking',
  async (bookingId: number, { rejectWithValue }) => {
    try {
      const response = await bookingsApi.confirm(bookingId);
      return { bookingId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось подтвердить бронирование');
    }
  }
);

export const completeBooking = createAsyncThunk(
  'bookings/completeBooking',
  async (bookingId: number, { rejectWithValue }) => {
    try {
      const response = await bookingsApi.complete(bookingId);
      return { bookingId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось завершить бронирование');
    }
  }
);

export const markNoShow = createAsyncThunk(
  'bookings/markNoShow',
  async (bookingId: number, { rejectWithValue }) => {
    try {
      const response = await bookingsApi.noShow(bookingId);
      return { bookingId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось отметить неявку клиента');
    }
  }
);

// Редьюсер
const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchBookings
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<{ bookings: Booking[]; totalItems: number }>) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка fetchBookingById
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.loading = false;
        state.selectedBooking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка createBooking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.loading = false;
        state.bookings.push(action.payload);
        state.totalItems += 1;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка updateBooking
      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.loading = false;
        const index = state.bookings.findIndex(booking => booking.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.selectedBooking?.id === action.payload.id) {
          state.selectedBooking = action.payload;
        }
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка изменений статуса
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        const { bookingId, data } = action.payload;
        const index = state.bookings.findIndex(booking => booking.id === bookingId);
        if (index !== -1) {
          state.bookings[index] = { ...state.bookings[index], ...data };
        }
        if (state.selectedBooking?.id === bookingId) {
          state.selectedBooking = { ...state.selectedBooking, ...data };
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(confirmBooking.fulfilled, (state, action) => {
        state.loading = false;
        const { bookingId, data } = action.payload;
        const index = state.bookings.findIndex(booking => booking.id === bookingId);
        if (index !== -1) {
          state.bookings[index] = { ...state.bookings[index], ...data };
        }
        if (state.selectedBooking?.id === bookingId) {
          state.selectedBooking = { ...state.selectedBooking, ...data };
        }
      })
      .addCase(confirmBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(completeBooking.fulfilled, (state, action) => {
        state.loading = false;
        const { bookingId, data } = action.payload;
        const index = state.bookings.findIndex(booking => booking.id === bookingId);
        if (index !== -1) {
          state.bookings[index] = { ...state.bookings[index], ...data };
        }
        if (state.selectedBooking?.id === bookingId) {
          state.selectedBooking = { ...state.selectedBooking, ...data };
        }
      })
      .addCase(completeBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(markNoShow.fulfilled, (state, action) => {
        state.loading = false;
        const { bookingId, data } = action.payload;
        const index = state.bookings.findIndex(booking => booking.id === bookingId);
        if (index !== -1) {
          state.bookings[index] = { ...state.bookings[index], ...data };
        }
        if (state.selectedBooking?.id === bookingId) {
          state.selectedBooking = { ...state.selectedBooking, ...data };
        }
      })
      .addCase(markNoShow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedBooking, clearError } = bookingsSlice.actions;
export default bookingsSlice.reducer; 