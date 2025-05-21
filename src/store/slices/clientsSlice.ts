import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Client, ClientsState } from '../../types';
import { clientsApi } from '../../api/api';

// Начальное состояние
const initialState: ClientsState = {
  clients: [],
  selectedClient: null,
  loading: false,
  error: null,
  totalItems: 0,
};

// Асинхронные экшены
export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await clientsApi.getAll(params);
      console.log('API Response:', response.data);
      
      // Обрабатываем ответ API в формате { data: [...], pagination: {...} }
      let clients = [];
      let totalItems = 0;
      
      if (response.data.data && Array.isArray(response.data.data)) {
        // Стандартная структура ответа API
        clients = response.data.data;
        totalItems = response.data.pagination?.total_count || 0;
      } else if (Array.isArray(response.data)) {
        // Если API вернул просто массив
        clients = response.data;
        totalItems = clients.length;
      } else {
        console.warn('Unexpected API response format:', response.data);
        // Если формат не распознан, возвращаем пустой массив
        clients = [];
        totalItems = 0;
      }
      
      return {
        clients,
        totalItems,
      };
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      return rejectWithValue(error.response?.data?.error || 'Не удалось загрузить клиентов');
    }
  }
);

export const fetchClientById = createAsyncThunk(
  'clients/fetchClientById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await clientsApi.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось найти клиента');
    }
  }
);

export const createClient = createAsyncThunk(
  'clients/createClient',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await clientsApi.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось создать клиента');
    }
  }
);

export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await clientsApi.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось обновить клиента');
    }
  }
);

export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async (id: number, { rejectWithValue }) => {
    try {
      await clientsApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось удалить клиента');
    }
  }
);

// Редьюсер
const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearSelectedClient: (state) => {
      state.selectedClient = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchClients
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action: PayloadAction<{ clients: Client[]; totalItems: number }>) => {
        state.loading = false;
        state.clients = action.payload.clients;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка fetchClientById
      .addCase(fetchClientById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientById.fulfilled, (state, action: PayloadAction<Client>) => {
        state.loading = false;
        state.selectedClient = action.payload;
      })
      .addCase(fetchClientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка createClient
      .addCase(createClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClient.fulfilled, (state, action: PayloadAction<Client>) => {
        state.loading = false;
        state.clients.push(action.payload);
        state.totalItems += 1;
      })
      .addCase(createClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка updateClient
      .addCase(updateClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClient.fulfilled, (state, action: PayloadAction<Client>) => {
        state.loading = false;
        const index = state.clients.findIndex(client => client.id === action.payload.id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
        if (state.selectedClient?.id === action.payload.id) {
          state.selectedClient = action.payload;
        }
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка deleteClient
      .addCase(deleteClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClient.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.clients = state.clients.filter(client => client.id !== action.payload);
        state.totalItems -= 1;
        if (state.selectedClient?.id === action.payload) {
          state.selectedClient = null;
        }
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedClient, clearError } = clientsSlice.actions;
export default clientsSlice.reducer; 