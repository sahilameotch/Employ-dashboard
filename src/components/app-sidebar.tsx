import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, end: true },
  { title: "Employees", url: "/employees", icon: Users, end: false },
  { title: "Add Employee", url: "/employees/new", icon: UserPlus, end: false },
];

function SidebarEdgeToggle() {
  const { toggleSidebar, state, isMobile } = useSidebar();

  if (isMobile) return null;

  const collapsed = state === "collapsed";

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={cn(
        "absolute top-1/2 z-30 flex size-7 -translate-y-1/2 items-center justify-center rounded-full",
        "border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-md",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        "right-0 translate-x-1/2",
      )}
    >
      {collapsed ? (
        <ChevronRight className="size-4" />
      ) : (
        <ChevronLeft className="size-4" />
      )}
    </button>
  );
}

export function AppSidebar() {
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

  const closeOnNavigate = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarEdgeToggle />
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Employ Dashboard">
              <NavLink to="/" onClick={closeOnNavigate}>
                <div className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-display font-semibold">
                    Employ Dashboard
                  </span>
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
                  : pathname === item.url ||
                    pathname.startsWith(`${item.url}/`);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                    >
                      <NavLink to={item.url} onClick={closeOnNavigate}>
                        <item.icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {/* <div className="rounded-lg bg-sidebar-accent px-3 py-2 text-xs text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden">
          <p className="font-medium">Live API</p>
          <p className="text-sidebar-foreground/60">/api/employees</p>
        </div> */}
      </SidebarFooter>
    </Sidebar>
  );
}
