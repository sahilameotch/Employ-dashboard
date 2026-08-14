import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  UserCheck,
  UserX,
  ArrowRight,
  Plus,
  Building2,
  Briefcase,
  CalendarDays,
  IndianRupee,
  Search,
} from 'lucide-react'
import { useGetEmployeesQuery } from '@/features/employees/employeesApi'
import type { Employee } from '@/features/employees/types'
import { EMPLOYEE_STATUS, EMPLOYEE_STATUS_LABEL } from '@/features/employees/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function buildDepartmentStats(employees: Employee[]) {
  const map = new Map<string, { total: number; active: number }>()
  for (const emp of employees) {
    const key = emp.department || 'Unassigned'
    const current = map.get(key) ?? { total: 0, active: 0 }
    current.total += 1
    if (emp.status === EMPLOYEE_STATUS.Active) current.active += 1
    map.set(key, current)
  }
  return [...map.entries()]
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.total - a.total)
}

export function DashboardPage() {
  const { data = [], isLoading, isError, refetch } = useGetEmployeesQuery()

  const stats = useMemo(() => {
    const total = data.length
    const active = data.filter((e) => e.status === EMPLOYEE_STATUS.Active).length
    const inactive = total - active
    const departments = new Set(data.map((e) => e.department).filter(Boolean)).size
    const avgSalary =
      total > 0 ? Math.round(data.reduce((sum, e) => sum + (e.salary || 0), 0) / total) : 0
    const recentHires = [...data]
      .sort((a, b) => b.joiningDate.localeCompare(a.joiningDate))
      .slice(0, 5)
    const recentActivity = [...data]
      .sort((a, b) => {
        const aTime = a.updatedAt || a.createdAt || a.joiningDate
        const bTime = b.updatedAt || b.createdAt || b.joiningDate
        return String(bTime).localeCompare(String(aTime))
      })
      .slice(0, 6)
    const departmentStats = buildDepartmentStats(data)
    const activeRate = total > 0 ? Math.round((active / total) * 100) : 0

    return {
      total,
      active,
      inactive,
      departments,
      avgSalary,
      recentHires,
      recentActivity,
      departmentStats,
      activeRate,
    }
  }, [data])

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const summaryCards = [
    {
      label: 'Total Employees',
      value: stats.total,
      icon: Users,
      hint: 'All records in directory',
      tone: 'bg-primary/10 text-primary',
    },
    {
      label: 'Active',
      value: stats.active,
      icon: UserCheck,
      hint: `${stats.activeRate}% of workforce`,
      tone: 'bg-forest/15 text-forest',
    },
    {
      label: 'Inactive',
      value: stats.inactive,
      icon: UserX,
      hint: 'Disabled or offboarded',
      tone: 'bg-gold/20 text-gold-foreground',
    },
    {
      label: 'Departments',
      value: stats.departments,
      icon: Building2,
      hint: 'Unique teams represented',
      tone: 'bg-primary/10 text-primary',
    },
  ]

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="relative bg-primary px-6 py-7 text-primary-foreground sm:px-8">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gold" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <p className="text-sm tracking-wide text-primary-foreground/70">{today}</p>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {getGreeting()}, HR team
              </h2>
              <p className="text-sm text-primary-foreground/75 sm:text-base">
                Track workforce health, review recent joiners, and manage employee records from one
                place.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary" className="bg-card text-foreground hover:bg-card/90">
                <Link to="/employees">
                  <Search />
                  Browse directory
                </Link>
              </Button>
              <Button asChild className="border border-gold/50 bg-gold text-gold-foreground hover:bg-gold/90">
                <Link to="/employees/new">
                  <Plus />
                  Add employee
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {isError ? (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load dashboard</CardTitle>
            <CardDescription>Check the API connection and try again.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="sm:hidden">
            <Card className="overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-y">
                {summaryCards.map((card) => (
                  <div key={card.label} className="flex items-center gap-3 p-3.5">
                    <span className={`shrink-0 rounded-md p-2 ${card.tone}`}>
                      <card.icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {card.label}
                      </p>
                      {isLoading ? (
                        <Skeleton className="mt-1 h-6 w-10" />
                      ) : (
                        <p className="font-display text-xl font-semibold leading-tight">
                          {card.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section className="hidden gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <Card key={card.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.label}
                  </CardTitle>
                  <span className={`rounded-md p-2 ${card.tone}`}>
                    <card.icon className="size-4" />
                  </span>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    <div className="font-display text-3xl font-semibold tracking-tight">
                      {card.value}
                    </div>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Workforce composition</CardTitle>
                  <CardDescription>Active vs inactive distribution</CardDescription>
                </div>
                <Badge variant="secondary">{stats.activeRate}% active</Badge>
              </CardHeader>
              <CardContent className="space-y-5">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : stats.total === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No employees yet. Add your first record to populate insights.
                  </p>
                ) : (
                  <>
                    <div className="h-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-forest transition-all"
                        style={{ width: `${stats.activeRate}%` }}
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-md border bg-muted/40 p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <UserCheck className="size-4 text-forest" />
                          Active
                        </div>
                        <p className="mt-2 font-display text-2xl font-semibold">{stats.active}</p>
                      </div>
                      <div className="rounded-md border bg-muted/40 p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <UserX className="size-4 text-gold-foreground" />
                          Inactive
                        </div>
                        <p className="mt-2 font-display text-2xl font-semibold">{stats.inactive}</p>
                      </div>
                      <div className="rounded-md border bg-muted/40 p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <IndianRupee className="size-4 text-primary" />
                          Avg salary
                        </div>
                        <p className="mt-2 font-display text-xl font-semibold">
                          {formatCurrency(stats.avgSalary)}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
                <CardDescription>Jump into common HR tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  to="/employees/new"
                  className="flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent"
                >
                  <span className="rounded-md bg-primary/10 p-2 text-primary">
                    <Plus className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Add employee</p>
                    <p className="text-xs text-muted-foreground">Create a new profile</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
                <Link
                  to="/employees"
                  className="flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent"
                >
                  <span className="rounded-md bg-gold/20 p-2 text-gold-foreground">
                    <Search className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Search directory</p>
                    <p className="text-xs text-muted-foreground">Find by name or code</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
                <Link
                  to="/employees"
                  className="flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent"
                >
                  <span className="rounded-md bg-forest/15 p-2 text-forest">
                    <Briefcase className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Review records</p>
                    <p className="text-xs text-muted-foreground">Edit or offboard staff</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 lg:grid-cols-5">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Departments</CardTitle>
                <CardDescription>Headcount by team</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : stats.departmentStats.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No department data available.</p>
                ) : (
                  <ul className="space-y-3">
                    {stats.departmentStats.slice(0, 6).map((dept) => {
                      const width = stats.total
                        ? Math.max(8, Math.round((dept.total / stats.total) * 100))
                        : 0
                      return (
                        <li key={dept.name} className="space-y-1.5">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="truncate font-medium">{dept.name}</span>
                            <span className="shrink-0 text-muted-foreground">
                              {dept.total} · {dept.active} active
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary/80"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent joiners</CardTitle>
                  <CardDescription>Latest employees by joining date</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/employees">
                    View all
                    <ArrowRight />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="space-y-3 p-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : stats.recentHires.length === 0 ? (
                  <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                    No employees to show yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead className="hidden sm:table-cell">Department</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentHires.map((emp) => (
                        <TableRow key={emp.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {emp.firstName} {emp.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{emp.employeeCode}</p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{emp.department}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1 text-sm">
                              <CalendarDays className="size-3.5 text-muted-foreground" />
                              {formatDate(emp.joiningDate)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                emp.status === EMPLOYEE_STATUS.Active ? 'success' : 'secondary'
                              }
                            >
                              {EMPLOYEE_STATUS_LABEL[emp.status]}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Directory snapshot</CardTitle>
              <CardDescription>Recently created or updated employee records</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-3 p-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : stats.recentActivity.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                  Activity will appear here once employees are added.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Role</TableHead>
                      <TableHead className="hidden lg:table-cell">Salary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentActivity.map((emp) => (
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
                        <TableCell className="hidden md:table-cell">
                          <div>
                            <p>{emp.designation}</p>
                            <p className="text-xs text-muted-foreground">{emp.department}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {formatCurrency(emp.salary)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              emp.status === EMPLOYEE_STATUS.Active ? 'success' : 'secondary'
                            }
                          >
                            {EMPLOYEE_STATUS_LABEL[emp.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/employees/${emp.id}/edit`}>Edit</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
