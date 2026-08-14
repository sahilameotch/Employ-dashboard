import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  useAddEmployeeMutation,
  useGetEmployeeByIdQuery,
  useGetEmployeesQuery,
  useUpdateEmployeeMutation,
} from "@/features/employees/employeesApi";
import type {
  EmployeeFormData,
  EmployeeStatus,
} from "@/features/employees/types";
import { EMPLOYEE_STATUS } from "@/features/employees/types";
import {
  DEPARTMENTS,
  emptyEmployeeForm,
  getApiErrorMessage,
  nextEmployeeCode,
  validateEmployeeForm,
  type FormErrors,
} from "@/features/employees/validation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export function AddEmployeePage() {
  return <EmployeeFormPage mode="add" />;
}

export function EditEmployeePage() {
  const { id = "" } = useParams();
  return <EmployeeFormPage mode="edit" employeeId={id} />;
}

function EmployeeFormPage({
  mode,
  employeeId,
}: {
  mode: "add" | "edit";
  employeeId?: string;
}) {
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const {
    data: existing,
    isLoading: isLoadingEmployee,
    isError: isLoadError,
    refetch,
  } = useGetEmployeeByIdQuery(employeeId!, { skip: !isEdit || !employeeId });

  const { data: allEmployees = [] } = useGetEmployeesQuery(undefined, {
    skip: isEdit,
  });

  const [addEmployee, { isLoading: isAdding }] = useAddEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();

  const [form, setForm] = useState<EmployeeFormData>(emptyEmployeeForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);

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
        joiningDate: existing.joiningDate.slice(0, 10),
        salary: existing.salary,
        status: existing.status,
      });
    }
  }, [existing]);

  useEffect(() => {
    if (isEdit) return;
    setForm((prev) => {
      if (prev.employeeCode) return prev;
      return {
        ...prev,
        employeeCode: nextEmployeeCode(allEmployees.map((e) => e.employeeCode)),
      };
    });
  }, [isEdit, allEmployees]);

  const setField = <K extends keyof EmployeeFormData>(
    key: K,
    value: EmployeeFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setApiError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors = validateEmployeeForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    try {
      if (isEdit && employeeId) {
        await updateEmployee({ id: employeeId, data: form }).unwrap();
        toast.success("Employee updated successfully");
      } else {
        await addEmployee(form).unwrap();
        toast.success("Employee added successfully");
      }
      navigate("/employees");
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "Something went wrong. Please try again.",
      );
      setApiError(message);
      toast.error(message);
    }
  };

  if (isEdit && isLoadingEmployee) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isEdit && (isLoadError || !existing)) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Employee not found</CardTitle>
          <CardDescription>The record may have been removed.</CardDescription>
        </CardHeader>
        <CardFooter className="gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
          <Button asChild>
            <Link to="/employees">Back to list</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const saving = isAdding || isUpdating;
  const fieldClass = (key: keyof FormErrors) =>
    errors[key] ? "border-destructive focus-visible:ring-destructive" : "";

  return (
    <div className="mx-auto w-full max-w-3xl pb-24 sm:pb-0">
      <form onSubmit={handleSubmit} noValidate>
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? "Edit employee" : "Add employee"}</CardTitle>
            <CardDescription>
              {isEdit
                ? "Update employee details and save changes"
                : "Fill in the details to create a new employee record"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {apiError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {apiError}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Employee Code"
                error={errors.employeeCode}
                htmlFor="employeeCode"
              >
                <Input
                  id="employeeCode"
                  value={form.employeeCode}
                  onChange={(e) => setField("employeeCode", e.target.value)}
                  className={fieldClass("employeeCode")}
                  disabled
                />
              </Field>
              <Field label="Status" error={errors.status} htmlFor="status">
                <select
                  id="status"
                  className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${fieldClass("status")}`}
                  value={form.status}
                  onChange={(e) =>
                    setField("status", Number(e.target.value) as EmployeeStatus)
                  }
                >
                  <option value={EMPLOYEE_STATUS.Active}>Active</option>
                  <option value={EMPLOYEE_STATUS.Inactive}>Inactive</option>
                </select>
              </Field>
              <Field
                label="First Name"
                error={errors.firstName}
                htmlFor="firstName"
              >
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => setField("firstName", e.target.value)}
                  className={fieldClass("firstName")}
                />
              </Field>
              <Field
                label="Last Name"
                error={errors.lastName}
                htmlFor="lastName"
              >
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => setField("lastName", e.target.value)}
                  className={fieldClass("lastName")}
                />
              </Field>
              <Field label="Email" error={errors.email} htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  className={fieldClass("email")}
                />
              </Field>
              <Field label="Phone" error={errors.phone} htmlFor="phone">
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  className={fieldClass("phone")}
                  placeholder="+91 xxxx-xxx-xxxx"
                />
              </Field>
              <Field
                label="Department"
                error={errors.department}
                htmlFor="department"
              >
                <select
                  id="department"
                  className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${fieldClass("department")}`}
                  value={form.department}
                  onChange={(e) => setField("department", e.target.value)}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label="Designation"
                error={errors.designation}
                htmlFor="designation"
              >
                <Input
                  id="designation"
                  value={form.designation}
                  onChange={(e) => setField("designation", e.target.value)}
                  className={fieldClass("designation")}
                  placeholder="Software Engineer"
                />
              </Field>
              <Field
                label="Joining Date"
                error={errors.joiningDate}
                htmlFor="joiningDate"
              >
                <Input
                  id="joiningDate"
                  type="date"
                  value={form.joiningDate}
                  onChange={(e) => setField("joiningDate", e.target.value)}
                  className={fieldClass("joiningDate")}
                />
              </Field>
              <Field label="Salary" error={errors.salary} htmlFor="salary">
                <Input
                  id="salary"
                  type="number"
                  min={0}
                  value={form.salary || ""}
                  onChange={(e) => setField("salary", Number(e.target.value))}
                  className={fieldClass("salary")}
                  placeholder="800000"
                />
              </Field>
            </div>
          </CardContent>
          <CardFooter className="hidden border-t pt-6 sm:flex sm:justify-end">
            <Button asChild type="button" variant="ghost" className="mr-auto">
              <Link to="/">Cancel</Link>
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Create Employee"}
            </Button>
          </CardFooter>
        </Card>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-2">
            <Button asChild type="button" variant="outline" className="h-12">
              <Link to="/">Cancel</Link>
            </Button>
            <Button type="submit" className="h-12" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>
        {label} <span className="text-destructive">*</span>
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
