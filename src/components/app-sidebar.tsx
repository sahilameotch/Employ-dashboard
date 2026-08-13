import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'

const mainNav = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard, end: true },
  { title: 'Employees', url: '/employees', icon: Users, end: false },
  { title: 'Add Employee', url: '/employees/new', icon: UserPlus, end: false },
]

export function AppSidebar() {
  const { pathname } = useLocation()

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Employ Dashboard">
              <NavLink to="/">
                <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Dashboard</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    HR Management
                  </span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const active = item.end
                  ? pathname === item.url
                  : pathname === item.url || pathname.startsWith(`${item.url}/`)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <NavLink to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="rounded-lg bg-sidebar-accent px-3 py-2 text-xs text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden">
          <p className="font-medium">API mode</p>
          <p className="text-sidebar-foreground/60">Dummy endpoints · swap base URL later</p>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
