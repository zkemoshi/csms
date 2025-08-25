// src/slices/apiSlice.js
import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: '/',          // <-- important for your proxy/backend
  credentials: 'include',   // if you use cookies/session auth
  // DO NOT set Content-Type globally; let the browser set it for FormData
  prepareHeaders: (headers, { getState }) => {
    // Example: attach auth token if you use Bearer (optional)
    const token = getState()?.auth?.userInfo?.token;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Prices', 'Masoko', 'Mazao'],
  endpoints: () => ({}),
});