import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UsersState } from '../../types';
import { User, ApiUser, UsersResponse, usersApi } from '../../api/users';

// Начальное состояние
const initialState: UsersState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  totalItems: 0,
};

// Асинхронные экшены
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await usersApi.getAll(params);
      const data = response.data;
      console.log('API Response:', data);
      
      // Handle API response format variations
      let users = [];
      let totalItems = 0;

      if (data.data && Array.isArray(data.data)) {
        users = data.data;
        totalItems = data.pagination?.total_count || users.length;
      } else if (data.users && Array.isArray(data.users)) {
        users = data.users;
        totalItems = data.total_items || users.length;
      } else if (Array.isArray(data)) {
        users = data;
        totalItems = users.length;
      } else {
        console.warn('Unexpected API response format:', data);
        throw new Error('Invalid API response format');
      }

      return {
        users,
        totalItems,
      };
    } catch (error: any) {
      console.error('Error fetching users:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Не удалось загрузить пользователей';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await usersApi.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось найти пользователя');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await usersApi.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось создать пользователя');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await usersApi.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось обновить пользователя');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: number, { rejectWithValue }) => {
    try {
      await usersApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось удалить пользователя');
    }
  }
);

export const changeUserRole = createAsyncThunk(
  'users/changeUserRole',
  async ({ id, role }: { id: number; role: string }, { rejectWithValue }) => {
    try {
      const response = await usersApi.changeRole(id, role);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось изменить роль пользователя');
    }
  }
);

export const changeUserStatus = createAsyncThunk(
  'users/changeUserStatus',
  async ({ id, isActive }: { id: number; isActive: boolean }, { rejectWithValue }) => {
    try {
      const response = await usersApi.changeStatus(id, isActive);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Не удалось изменить статус пользователя');
    }
  }
);

// Редьюсер
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<{ users: ApiUser[]; totalItems: number }>) => {
        state.loading = false;
        state.users = action.payload.users.map(apiUser => ({
          ...apiUser,
          first_name: apiUser.first_name || '',
          last_name: apiUser.last_name || '',
          phone: apiUser.phone || '',
          role: apiUser.role || 'client',
          is_active: apiUser.is_active ?? true,
        }));
        state.totalItems = action.payload.totalItems;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка fetchUserById
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<ApiUser>) => {
        state.loading = false;
        state.selectedUser = {
          ...action.payload,
          first_name: action.payload.first_name || '',
          last_name: action.payload.last_name || '',
          phone: action.payload.phone || '',
          role: action.payload.role || 'client',
          is_active: action.payload.is_active ?? true,
        };
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка createUser
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.users.push(action.payload);
        state.totalItems += 1;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка updateUser
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка deleteUser
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
        state.totalItems -= 1;
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка changeUserRole
      .addCase(changeUserRole.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
      })
      
      // Обработка changeUserStatus
      .addCase(changeUserStatus.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
      });
  },
});

export const { clearSelectedUser, clearError } = usersSlice.actions;
export default usersSlice.reducer;