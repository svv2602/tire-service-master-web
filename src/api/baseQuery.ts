import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../config';

const STORAGE_KEY = config.AUTH_TOKEN_STORAGE_KEY;

export const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8000/api/v1/',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});
