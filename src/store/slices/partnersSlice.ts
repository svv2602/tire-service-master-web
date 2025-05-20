import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Partner, PartnersState } from '../../types';
import { partnersApi } from '../../api/api';

// Начальное состояние
const initialState: PartnersState = {
  partners: [],
  selectedPartner: null,
  loading: false,
  error: null,
  totalItems: 0,
};

// Асинхронные экшены
export const fetchPartners = createAsyncThunk(
  'partners/fetchPartners',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await partnersApi.getAll(params);
      return {
        partners: response.data.partners,
        totalItems: response.data.total_items || response.data.partners.length,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось загрузить партнеров');
    }
  }
);

export const fetchPartnerById = createAsyncThunk(
  'partners/fetchPartnerById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await partnersApi.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось найти партнера');
    }
  }
);

export const createPartner = createAsyncThunk(
  'partners/createPartner',
  async (partnerData: { 
    company_name: string;
    contact_person?: string;
    company_description?: string;
    website?: string;
    tax_number?: string;
    legal_address?: string;
    logo_url?: string;
    user: {
      email: string;
      phone?: string;
      first_name: string;
      last_name: string;
      middle_name?: string;
    }
  }, { rejectWithValue }) => {
    try {
      const response = await partnersApi.create(partnerData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось создать партнера');
    }
  }
);

export const updatePartner = createAsyncThunk(
  'partners/updatePartner',
  async ({ id, data }: { 
    id: number; 
    data: {
      company_name?: string;
      contact_person?: string;
      company_description?: string;
      website?: string;
      tax_number?: string;
      legal_address?: string;
      logo_url?: string;
      user?: {
        email?: string;
        phone?: string;
        first_name?: string;
        last_name?: string;
        middle_name?: string;
      }
    } 
  }, { rejectWithValue }) => {
    try {
      const response = await partnersApi.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось обновить партнера');
    }
  }
);

export const deletePartner = createAsyncThunk(
  'partners/deletePartner',
  async (id: number, { rejectWithValue }) => {
    try {
      await partnersApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось удалить партнера');
    }
  }
);

// Редьюсер
const partnersSlice = createSlice({
  name: 'partners',
  initialState,
  reducers: {
    clearSelectedPartner: (state) => {
      state.selectedPartner = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchPartners
      .addCase(fetchPartners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPartners.fulfilled, (state, action: PayloadAction<{ partners: Partner[]; totalItems: number }>) => {
        state.loading = false;
        state.partners = action.payload.partners;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(fetchPartners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка fetchPartnerById
      .addCase(fetchPartnerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPartnerById.fulfilled, (state, action: PayloadAction<Partner>) => {
        state.loading = false;
        state.selectedPartner = action.payload;
      })
      .addCase(fetchPartnerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка createPartner
      .addCase(createPartner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPartner.fulfilled, (state, action: PayloadAction<Partner>) => {
        state.loading = false;
        state.partners.push(action.payload);
        state.totalItems += 1;
      })
      .addCase(createPartner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка updatePartner
      .addCase(updatePartner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePartner.fulfilled, (state, action: PayloadAction<Partner>) => {
        state.loading = false;
        const index = state.partners.findIndex(partner => partner.id === action.payload.id);
        if (index !== -1) {
          state.partners[index] = action.payload;
        }
        if (state.selectedPartner?.id === action.payload.id) {
          state.selectedPartner = action.payload;
        }
      })
      .addCase(updatePartner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка deletePartner
      .addCase(deletePartner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePartner.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.partners = state.partners.filter(partner => partner.id !== action.payload);
        state.totalItems -= 1;
        if (state.selectedPartner?.id === action.payload) {
          state.selectedPartner = null;
        }
      })
      .addCase(deletePartner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedPartner, clearError } = partnersSlice.actions;
export default partnersSlice.reducer; 