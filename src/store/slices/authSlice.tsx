import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../api/api';
import { User } from '../../types/user';
import { AuthState, LoginResponse } from '../../types/auth';
import { UserRole } from '../../types';
import axios from 'axios';
import config from '../../config'; 