import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const rawBase = import.meta.env.VITE_API_BASE_URL || "/api";
const baseUrl = rawBase.replace(/\/+$/, "");

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      headers.set("Accept", "application/json");
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Employee"],
  endpoints: () => ({}),
});
