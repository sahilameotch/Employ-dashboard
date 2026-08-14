import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

/**
 * Always call same-origin `/api` in the browser.
 * Local: Vite proxy (vite.config.ts)
 * Deployed: host rewrites (vercel.json / netlify.toml / public/_redirects)
 */
const rawBase = import.meta.env.VITE_API_BASE_URL || '/api'
const baseUrl = rawBase.replace(/\/+$/, '')

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Employee'],
  endpoints: () => ({}),
})
