export type EmployeeStatus = 'Active' | 'Inactive'

export interface Employee {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  designation: string
  joiningDate: string
  salary: number
  status: EmployeeStatus
}

export type EmployeeFormData = Omit<Employee, 'id'>

export interface EmployeeListParams {
  search?: string
  page?: number
  pageSize?: number
  status?: EmployeeStatus | 'All'
}

export interface EmployeeListResponse {
  data: Employee[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface EmployeeSummary {
  total: number
  active: number
  inactive: number
}
