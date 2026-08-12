import {
  Bot,
  Building2,
  CreditCard,
  Gauge,
  House,
  LayoutDashboard,
  Loader2,
  LogOut,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  useSidebar,
} from '@/components/ui/sidebar';

interface AdminSidebarProps {
  email: string | null;
  isLogoutPending?: boolean;
  onLogout: () => void;
}

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Tenants',
    to: '/admin/tenants',
    icon: Building2,
  },
  {
    label: 'Subscriptions',
    to: '/admin/subscriptions',
    icon: CreditCard,
  },
  {
    label: 'AI assistant',
    to: '/admin/ai-chatbot',
    icon: Bot,
  },
  {
    label: 'Settings',
    to: '/admin/settings',
    icon: SlidersHorizontal,
  },
] as const;

export function AdminSidebar({
  email,
  isLogoutPending = false,
  onLogout,
}: AdminSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const navigate = useNavigate();
  const emailInitial = email?.trim().charAt(0).toUpperCase() ?? 'A';

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-auto py-2"
              size="lg"
              asChild={false}
            >
              <span className="bg-primary/14 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
                <Gauge className="size-4" aria-hidden />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5 leading-tight">
                <span className="font-semibold tracking-tight">Control center</span>
                <span className="text-muted-foreground text-[0.65rem] font-medium uppercase tracking-wider">
                  Platform view
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <NavLink
                      to={item.to}
                      onClick={() => {
                        if (isMobile) {
                          setOpenMobile(false);
                        }
                      }}
                      className={({ isActive }) =>
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : ''
                      }
                    >
                      <item.icon aria-hidden />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-auto py-2"
                  size="lg"
                >
                  <span className="bg-primary/14 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                    {emailInitial}
                  </span>
                  <div className="flex min-w-0 flex-col gap-0.5 leading-tight">
                    <span className="truncate text-sm font-medium">Admin account</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {email ?? 'No email'}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64"
                side="top"
                sideOffset={8}
              >
                <DropdownMenuLabel className="space-y-1">
                  <p className="text-foreground text-sm font-semibold leading-none">
                    Admin menu
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {email ?? 'No email found'}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onSelect={(e: Event) => {
                      e.preventDefault();
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                      void navigate('/admin/settings');
                    }}
                  >
                    <ShieldCheck aria-hidden />
                    Security &amp; 2FA
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(e: Event) => {
                      e.preventDefault();
                      void navigate('/');
                    }}
                  >
                    <House aria-hidden />
                    Go to home
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  aria-busy={isLogoutPending}
                  disabled={isLogoutPending}
                  onSelect={(e: Event) => {
                    e.preventDefault();
                    if (isLogoutPending) {
                      return;
                    }
                    onLogout();
                  }}
                >
                  {isLogoutPending ? (
                    <Loader2 aria-hidden className="animate-spin" />
                  ) : (
                    <LogOut aria-hidden />
                  )}
                  {isLogoutPending ? 'Signing out…' : 'Log out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
