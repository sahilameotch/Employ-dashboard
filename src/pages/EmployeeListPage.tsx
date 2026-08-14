import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import {
  useDeleteEmployeeMutation,
  useGetEmployeesQuery,
  useSearchEmployeesQuery,
} from '@/features/employees/employeesApi'
import type { Employee, EmployeeStatus } from '@/features/employees/types'
import { EMPLOYEE_STATUS, EMPLOYEE_STATUS_LABEL } from '@/features/employees/types'
import { getApiErrorMessage } from '@/features/employees/validation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const PAGE_SIZE = 8

export function EmployeeListPage() {
  const [searchInput, setSearchInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<'All' | EmployeeStatus>('All')
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState<Employee | null>(null)

  const listQuery = useGetEmployeesQuery(undefined, { skip: Boolean(keyword) })
  const searchQuery = useSearchEmployeesQuery(
    { keyword },
    { skip: !keyword },
  )

  const activeQuery = keyword ? searchQuery : listQuery
  const employees = activeQuery.data ?? []
  const { isLoading, isFetching, isError, refetch } = activeQuery

  const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation()

  const filtered = useMemo(() => {
    if (status === 'All') return employees
    return employees.filter((e) => e.status === status)
  }, [employees, status])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageData = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setKeyword(searchInput.trim())
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setKeyword('')
    setPage(1)
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    try {
      await deleteEmployee(pendingDelete.id).unwrap()
      toast.success(
        `${pendingDelete.firstName} ${pendingDelete.lastName} deleted`,
      )
      setPendingDelete(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete employee'))
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <div className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
              Employee directory
            </h2>
            <p className="hidden text-sm text-muted-foreground sm:block">
              Search, filter, edit, or remove employee records.
            </p>
          </div>
          <Button asChild className="hidden sm:inline-flex">
            <Link to="/employees/new">
              <Plus />
              Add Employee
            </Link>
          </Button>
        </div>

        <Link
          to="/employees/new"
          className="relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-md bg-primary text-sm font-medium text-primary-foreground sm:hidden"
        >
          <span className="absolute inset-y-0 left-0 w-1 bg-gold" />
          <Plus className="size-4" />
          Add employee
        </Link>
      </div>

      <Card>
        <CardHeader className="hidden pb-3 sm:block">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Search the directory and filter by employment status
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 sm:pt-0">
          <form
            onSubmit={handleSearch}
            className="space-y-3 md:grid md:grid-cols-[1fr_160px_auto_auto] md:items-end md:gap-3 md:space-y-0"
          >
            <div className="space-y-2">
              <Label htmlFor="search" className="hidden sm:block">
                Search
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  className="h-11 pl-9 pr-20 sm:h-9 sm:pr-3"
                  placeholder="Search name, code, email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 px-3 sm:hidden"
                  disabled={isFetching && !isLoading}
                >
                  Go
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="hidden sm:block">
                Status
              </Label>
              <div className="grid grid-cols-3 rounded-md border bg-secondary/60 p-1 sm:hidden">
                {(
                  [
                    { label: 'All', value: 'All' as const },
                    { label: 'Active', value: EMPLOYEE_STATUS.Active },
                    { label: 'Inactive', value: EMPLOYEE_STATUS.Inactive },
                  ] as const
                ).map((option) => {
                  const selected = status === option.value
                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => {
                        setStatus(option.value)
                        setPage(1)
                      }}
                      className={[
                        'h-9 rounded-sm text-xs font-medium transition-colors',
                        selected
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground',
                      ].join(' ')}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
              <select
                id="status"
                className="hidden h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
                value={status === 'All' ? 'All' : String(status)}
                onChange={(e) => {
                  const value = e.target.value
                  setStatus(value === 'All' ? 'All' : (Number(value) as EmployeeStatus))
                  setPage(1)
                }}
              >
                <option value="All">All</option>
                <option value={EMPLOYEE_STATUS.Active}>Active</option>
                <option value={EMPLOYEE_STATUS.Inactive}>Inactive</option>
              </select>
            </div>

            <div className="hidden items-end sm:flex">
              <Button type="submit" className="w-full" disabled={isFetching && !isLoading}>
                Search
              </Button>
            </div>
            <div className="flex items-center sm:items-end">
              {(keyword || searchInput || status !== 'All') ? (
                <button
                  type="button"
                  onClick={() => {
                    handleClearSearch()
                    setStatus('All')
                  }}
                  className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:hidden"
                >
                  Clear filters
                </button>
              ) : (
                <span className="sm:hidden" />
              )}
              <Button
                type="button"
                variant="outline"
                className="hidden w-full sm:inline-flex"
                onClick={handleClearSearch}
                disabled={!keyword && !searchInput}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-start gap-3 p-6">
              <p className="text-sm text-muted-foreground">Could not load employees.</p>
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : pageData.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <p className="font-medium">No employees found</p>
              <p className="text-sm text-muted-foreground">
                Try a different search or add a new employee.
              </p>
              <Button asChild>
                <Link to="/employees/new">Add Employee</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className={isFetching ? 'opacity-60 transition-opacity' : ''}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Department</TableHead>
                      <TableHead className="hidden lg:table-cell">Designation</TableHead>
                      <TableHead className="hidden sm:table-cell">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageData.map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium text-primary">
                          {emp.employeeCode}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">{emp.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{emp.department}</TableCell>
                        <TableCell className="hidden lg:table-cell">{emp.designation}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge
                            variant={
                              emp.status === EMPLOYEE_STATUS.Active ? 'success' : 'secondary'
                            }
                          >
                            {EMPLOYEE_STATUS_LABEL[emp.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button asChild variant="ghost" size="icon">
                              <Link to={`/employees/${emp.id}/edit`} aria-label="Edit">
                                <Pencil />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setPendingDelete(emp)}
                              aria-label="Delete"
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
                <p className="text-sm text-muted-foreground">
                  Showing {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safePage * PAGE_SIZE, total)} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {safePage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete employee?</DialogTitle>
            <DialogDescription>
              {pendingDelete
                ? `This will permanently remove ${pendingDelete.firstName} ${pendingDelete.lastName} (${pendingDelete.employeeCode}).`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="h-11 sm:h-9"
              onClick={() => setPendingDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="h-11 sm:h-9"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
