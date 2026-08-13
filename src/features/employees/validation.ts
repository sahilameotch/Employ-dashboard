import type { EmployeeFormData } from '@/features/employees/types'

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

  if (!data.status) errors.status = 'Status is required'

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
  status: 'Active',
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
