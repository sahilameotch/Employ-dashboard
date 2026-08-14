import type { EmployeeFormData } from './types'
import { EMPLOYEE_STATUS } from './types'

export type FormErrors = Partial<Record<keyof EmployeeFormData, string>>

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^[+]?[\d\s\-()]{8,20}$/

export function validateEmployeeForm(data: EmployeeFormData): FormErrors {
  const errors: FormErrors = {}

  if (!data.employeeCode.trim()) errors.employeeCode = 'Employee code is required'
  if (!data.firstName.trim()) errors.firstName = 'First name is required'
  if (!data.lastName.trim()) errors.lastName = 'Last name is required'

  if (!data.email.trim()) errors.email = 'Email is required'
  else if (!emailRegex.test(data.email)) errors.email = 'Enter a valid email'

  if (!data.phone.trim()) errors.phone = 'Phone is required'
  else if (!phoneRegex.test(data.phone)) errors.phone = 'Enter a valid phone number'

  if (!data.department.trim()) errors.department = 'Department is required'
  if (!data.designation.trim()) errors.designation = 'Designation is required'
  if (!data.joiningDate) errors.joiningDate = 'Joining date is required'

  if (data.salary === undefined || data.salary === null || Number.isNaN(data.salary)) {
    errors.salary = 'Salary is required'
  } else if (data.salary <= 0) {
    errors.salary = 'Salary must be greater than 0'
  }

  if (data.status !== EMPLOYEE_STATUS.Active && data.status !== EMPLOYEE_STATUS.Inactive) {
    errors.status = 'Status is required'
  }

  return errors
}

export const emptyEmployeeForm: EmployeeFormData = {
  employeeCode: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  joiningDate: '',
  salary: 0,
  status: EMPLOYEE_STATUS.Active,
}

export const DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
  'Design',
]

export function nextEmployeeCode(codes: string[]) {
  const max = codes.reduce((acc, code) => {
    const n = Number(code.match(/\d+/)?.[0] ?? 0)
    return Number.isFinite(n) ? Math.max(acc, n) : acc
  }, 0)
  return `EMP${String(max + 1).padStart(3, '0')}`
}

export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong') {
  if (typeof err !== 'object' || !err || !('data' in err)) return fallback
  const data = (err as { data: unknown }).data
  if (typeof data === 'string') return data
  if (typeof data !== 'object' || !data) return fallback

  const record = data as {
    detail?: string
    title?: string
    message?: string
    errors?: Record<string, string[]>
  }

  if (record.errors) {
    const first = Object.values(record.errors).flat()[0]
    if (first) return first
  }
  return record.detail || record.message || record.title || fallback
}
