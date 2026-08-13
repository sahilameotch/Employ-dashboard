import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { dummyFetch } from '@/api/dummyFetch'

/**
 * Toggle dummy vs real API.
 * When real backend is ready:
 * 1. Set VITE_USE_DUMMY_API=false (or remove it)
 * 2. Set VITE_API_BASE_URL=https://your-api.com/api
 * Endpoint paths in feature APIs stay the same.
 */
const useDummyApi = import.meta.env.VITE_USE_DUMMY_API !== 'false'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    // Remove `fetchFn` when connecting the real API
    ...(useDummyApi ? { fetchFn: dummyFetch } : {}),
    prepareHeaders: (headers) => {
      // Later: attach auth token here
      // const token = localStorage.getItem('token')
      // if (token) headers.set('Authorization', `Bearer ${token}`)
      headers.set('Accept', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Employee', 'EmployeeSummary'],
  endpoints: () => ({}),
})
