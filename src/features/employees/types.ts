export type EmployeeStatus = 1 | 2

export const EMPLOYEE_STATUS = {
  Active: 1 as const,
  Inactive: 2 as const,
}

export const EMPLOYEE_STATUS_LABEL: Record<EmployeeStatus, 'Active' | 'Inactive'> = {
  1: 'Active',
  2: 'Inactive',
}

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
  createdAt?: string
  updatedAt?: string | null
}

export type EmployeeFormData = Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>

export interface EmployeeSearchParams {
  keyword: string
}
