import { baseApi } from '@/api/baseApi'
import type {
  Employee,
  EmployeeFormData,
  EmployeeListParams,
  EmployeeListResponse,
  EmployeeSummary,
} from './types'

export const employeesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<EmployeeListResponse, EmployeeListParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params?.search) searchParams.set('search', params.search)
        if (params?.page) searchParams.set('page', String(params.page))
        if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize))
        if (params?.status) searchParams.set('status', params.status)
        const qs = searchParams.toString()
        return {
          url: `/employees${qs ? `?${qs}` : ''}`,
          method: 'GET',
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Employee' as const, id })),
              { type: 'Employee', id: 'LIST' },
            ]
          : [{ type: 'Employee', id: 'LIST' }],
    }),

    getEmployeeById: builder.query<Employee, string>({
      query: (id) => ({
        url: `/employees/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Employee', id }],
    }),

    getEmployeeSummary: builder.query<EmployeeSummary, void>({
      query: () => ({
        url: '/employees/summary',
        method: 'GET',
      }),
      providesTags: ['EmployeeSummary'],
    }),

    addEmployee: builder.mutation<Employee, EmployeeFormData>({
      query: (body) => ({
        url: '/employees',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }, 'EmployeeSummary'],
    }),

    updateEmployee: builder.mutation<Employee, { id: string; data: EmployeeFormData }>({
      query: ({ id, data }) => ({
        url: `/employees/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Employee', id },
        { type: 'Employee', id: 'LIST' },
        'EmployeeSummary',
      ],
    }),

    deleteEmployee: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/employees/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }, 'EmployeeSummary'],
    }),
  }),
})

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useGetEmployeeSummaryQuery,
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeesApi
