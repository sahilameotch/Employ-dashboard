import { Link } from 'react-router-dom'
import { Users, UserCheck, UserX, ArrowRight, Plus } from 'lucide-react'
import { staticEmployeeSummary } from '@/features/employees/staticData'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardPage() {
  const cards = [
    {
      label: 'Total Employees',
      value: staticEmployeeSummary.total,
      icon: Users,
      hint: 'All records in directory',
    },
    {
      label: 'Active',
      value: staticEmployeeSummary.active,
      icon: UserCheck,
      hint: 'Currently employed',
    },
    {
      label: 'Inactive',
      value: staticEmployeeSummary.inactive,
      icon: UserX,
      hint: 'Disabled or offboarded',
    },
  ]

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Workforce overview</h2>
          <p className="text-sm text-muted-foreground">
            Monitor headcount and jump into employee management.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/employees">
              View directory
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild>
            <Link to="/employees/new">
              <Plus />
              Add employee
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <card.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">{card.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
          <CardDescription>Common HR tasks for this workspace</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/employees/new">Add Employee</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/employees">Browse Employees</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
