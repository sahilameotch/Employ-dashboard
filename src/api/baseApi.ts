import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { dummyFetch } from '@/api/dummyFetch'

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
