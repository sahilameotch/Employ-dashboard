import type { Employee, EmployeeListParams, EmployeeListResponse, EmployeeSummary } from './types'
import { seedEmployees } from './mockData'

/** Static data for UI only — replace with RTK Query hooks when wiring APIs */
export const staticEmployees: Employee[] = structuredClone(seedEmployees)

export const staticEmployeeSummary: EmployeeSummary = {
  total: staticEmployees.length,
  active: staticEmployees.filter((e) => e.status === 'Active').length,
  inactive: staticEmployees.filter((e) => e.status === 'Inactive').length,
}

export function filterStaticEmployees(
  employees: Employee[],
  params: EmployeeListParams = {},
): Employee[] {
  const search = params.search?.trim().toLowerCase() ?? ''
  const status = params.status ?? 'All'

  return employees.filter((emp) => {
    if (status !== 'All' && emp.status !== status) return false
    if (!search) return true
    const haystack = [
      emp.employeeCode,
      emp.firstName,
      emp.lastName,
      emp.email,
      emp.phone,
      emp.department,
      emp.designation,
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(search)
  })
}

export function paginateStaticEmployees(
  employees: Employee[],
  page = 1,
  pageSize = 8,
): EmployeeListResponse {
  const total = employees.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const start = (safePage - 1) * pageSize

  return {
    data: employees.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  }
}

export function getStaticEmployeeById(id: string): Employee | undefined {
  return staticEmployees.find((e) => e.id === id)
}
