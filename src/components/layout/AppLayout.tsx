import { Outlet, useLocation } from 'react-router-dom'
import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'

const titles: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Dashboard',
    description: 'Workforce overview and quick actions',
  },
  '/employees': {
    title: 'Employees',
    description: 'Search, manage, and maintain employee records',
  },
  '/employees/new': {
    title: 'Add Employee',
    description: 'Create a new employee profile',
  },
}

function resolveMeta(pathname: string) {
  if (titles[pathname]) return titles[pathname]
  if (pathname.startsWith('/employees/') && pathname.endsWith('/edit')) {
    return {
      title: 'Edit Employee',
      description: 'Update employee details and save changes',
    }
  }
  return { title: 'Employ Dashboard', description: 'HR workspace' }
}

export function AppLayout() {
  const { pathname } = useLocation()
  const meta = resolveMeta(pathname)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight">{meta.title}</h1>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              {meta.description}
            </p>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  )
}
