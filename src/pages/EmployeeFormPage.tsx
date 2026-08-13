import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import type { EmployeeFormData } from '@/features/employees/types'
import { getStaticEmployeeById, nextStaticEmployeeCode } from '@/features/employees/staticData'
import {
  DEPARTMENTS,
  emptyEmployeeForm,
  validateEmployeeForm,
  type FormErrors,
} from '@/features/employees/validation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AddEmployeePage() {
  return <EmployeeFormPage mode="add" />
}

export function EditEmployeePage() {
  const { id = '' } = useParams()
  return <EmployeeFormPage mode="edit" employeeId={id} />
}

function EmployeeFormPage({
  mode,
  employeeId,
}: {
  mode: 'add' | 'edit'
  employeeId?: string
}) {
  const navigate = useNavigate()
  const isEdit = mode === 'edit'
  const existing = isEdit && employeeId ? getStaticEmployeeById(employeeId) : undefined

  const [form, setForm] = useState<EmployeeFormData>(emptyEmployeeForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const nextEmployeeCode=nextStaticEmployeeCode();

  useEffect(() => {
    if (existing) {
      setForm({
        employeeCode: existing.employeeCode,
        firstName: existing.firstName,
        lastName: existing.lastName,
        email: existing.email,
        phone: existing.phone,
        department: existing.department,
        designation: existing.designation,
        joiningDate: existing.joiningDate,
        salary: existing.salary,
        status: existing.status,
      })
    }
  }, [existing])

  const setField = <K extends keyof EmployeeFormData>(key: K, value: EmployeeFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const nextErrors = validateEmployeeForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Please fix the highlighted fields')
      return
    }

    setSaving(true)
    setTimeout(() => {
      toast.success(isEdit ? 'Employee updated successfully' : 'Employee added successfully')
      setSaving(false)
      navigate('/employees')
    }, 400)
  }

  if (isEdit && !existing) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Employee not found</CardTitle>
          <CardDescription>The record may have been removed.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild>
            <Link to="/employees">Back  to list</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const fieldClass = (key: keyof FormErrors) =>
    errors[key] ? 'border-destructive focus-visible:ring-destructive' : ''

  const getEmployeeCode= (code: string) => {
    return isEdit ? code:nextEmployeeCode
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit employee' : 'Add employee'}</CardTitle>
          <CardDescription>
            {isEdit
              ? 'Update employee details and save changes'
              : 'Fill in the details to create a new employee record'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Employee Code" error={errors.employeeCode} htmlFor="employeeCode">
                <Input
                  id="employeeCode"
                  value={getEmployeeCode(form.employeeCode)}
                  onChange={(e) => setField('employeeCode', e.target.value)}
                  className={fieldClass('employeeCode')}
                  disabled
                />
              </Field>
              <Field label="Status" error={errors.status} htmlFor="status">
                <select
                  id="status"
                  className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${fieldClass('status')}`}
                  value={form.status}
                  onChange={(e) => setField('status', e.target.value as EmployeeFormData['status'])}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </Field>
              <Field label="First Name" error={errors.firstName} htmlFor="firstName">
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => setField('firstName', e.target.value)}
                  className={fieldClass('firstName')}
                />
              </Field>
              <Field label="Last Name" error={errors.lastName} htmlFor="lastName">
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => setField('lastName', e.target.value)}
                  className={fieldClass('lastName')}
                />
              </Field>
              <Field label="Email" error={errors.email} htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  className={fieldClass('email')}
                />
              </Field>
              <Field label="Phone" error={errors.phone} htmlFor="phone">
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  className={fieldClass('phone')}
                  placeholder="+91 xxxx-xxx-xxxxx"
                />
              </Field>
              <Field label="Department" error={errors.department} htmlFor="department">
                <select
                  id="department"
                  className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${fieldClass('department')}`}
                  value={form.department}
                  onChange={(e) => setField('department', e.target.value)}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Designation" error={errors.designation} htmlFor="designation">
                <Input
                  id="designation"
                  value={form.designation}
                  onChange={(e) => setField('designation', e.target.value)}
                  className={fieldClass('designation')}
                  placeholder="Software Engineer"
                />
              </Field>
              <Field label="Joining Date" error={errors.joiningDate} htmlFor="joiningDate">
                <Input
                  id="joiningDate"
                  type="date"
                  value={form.joiningDate}
                  onChange={(e) => setField('joiningDate', e.target.value)}
                  className={fieldClass('joiningDate')}
                />
              </Field>
              <Field label="Salary" error={errors.salary} htmlFor="salary">
                <Input
                  id="salary"
                  type="number"
                  min={0}
                  value={form.salary || ''}
                  onChange={(e) => setField('salary', Number(e.target.value))}
                  className={fieldClass('salary')}
                  placeholder="Rs xxx,xxx.xx"
                />
              </Field>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col-reverse gap-2 border-t pt-6 sm:flex-row sm:justify-end">
            <Button asChild type="button" variant="ghost" className="sm:mr-auto">
              <Link to="/employees">Cancel</Link>
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Employee'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>
        {label} <span className="text-destructive">*</span>
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
