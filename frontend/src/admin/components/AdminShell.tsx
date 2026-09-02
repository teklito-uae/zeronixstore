import { Fragment, createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Newspaper,
  LogOut,
  ChevronsUpDown,
  ExternalLink,
} from "lucide-react";
import { useAdminAuth } from "@/admin/auth/AuthContext";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/blog", label: "Journal", icon: Newspaper },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface Crumb {
  label: string;
  to?: string;
}

function routeBreadcrumbs(pathname: string): Crumb[] {
  const path = pathname.replace(/\/+$/, "") || "/admin";

  if (path === "/admin") return [{ label: "Dashboard" }];
  if (path === "/admin/products") return [{ label: "Products" }];
  if (path === "/admin/products/new") {
    return [{ label: "Products", to: "/admin/products" }, { label: "New product" }];
  }
  if (/^\/admin\/products\/[^/]+\/edit$/.test(path)) {
    return [{ label: "Products", to: "/admin/products" }, { label: "Edit product" }];
  }
  if (path === "/admin/orders") return [{ label: "Orders" }];
  if (/^\/admin\/orders\/[^/]+$/.test(path)) {
    return [{ label: "Orders", to: "/admin/orders" }, { label: "Order details" }];
  }
  if (path === "/admin/categories") return [{ label: "Categories" }];
  if (path === "/admin/blog") return [{ label: "Journal" }];
  if (path === "/admin/blog/new") {
    return [{ label: "Journal", to: "/admin/blog" }, { label: "New article" }];
  }
  if (/^\/admin\/blog\/[^/]+\/edit$/.test(path)) {
    return [{ label: "Journal", to: "/admin/blog" }, { label: "Edit article" }];
  }
  return [{ label: "Admin" }];
}

interface AdminPageChrome {
  setActions: (node: ReactNode) => void;
  setFooter: (node: ReactNode) => void;
  setBreadcrumbLabel: (label: string | null) => void;
}

const AdminPageChromeContext = createContext<AdminPageChrome | null>(null);

/** Renders page-specific action buttons (e.g. "New product") in the top header bar. */
export function usePageActions(node: ReactNode) {
  const chrome = useContext(AdminPageChromeContext);
  useEffect(() => {
    chrome?.setActions(node);
    return () => chrome?.setActions(null);
  }, [chrome, node]);
}

/** Renders page-specific content (e.g. pagination) pinned to the bottom of the admin viewport. */
export function usePageFooter(node: ReactNode) {
  const chrome = useContext(AdminPageChromeContext);
  useEffect(() => {
    chrome?.setFooter(node);
    return () => chrome?.setFooter(null);
  }, [chrome, node]);
}

/** Overrides the last breadcrumb segment with dynamic content (e.g. an order number). */
export function usePageBreadcrumbLabel(label: string | null) {
  const chrome = useContext(AdminPageChromeContext);
  useEffect(() => {
    chrome?.setBreadcrumbLabel(label);
    return () => chrome?.setBreadcrumbLabel(null);
  }, [chrome, label]);
}

export function AdminShell() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [actions, setActions] = useState<ReactNode>(null);
  const [footer, setFooter] = useState<ReactNode>(null);
  const [breadcrumbLabel, setBreadcrumbLabel] = useState<string | null>(null);

  const chrome = useMemo<AdminPageChrome>(
    () => ({ setActions, setFooter, setBreadcrumbLabel }),
    [],
  );

  const crumbs = useMemo(() => {
    const base = routeBreadcrumbs(location.pathname);
    if (!breadcrumbLabel) return base;
    return base.map((crumb, i) => (i === base.length - 1 ? { ...crumb, label: breadcrumbLabel } : crumb));
  }, [location.pathname, breadcrumbLabel]);

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2.5 px-2 py-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <span className="font-heading text-sm font-bold">Z</span>
              </div>
              <span className="truncate font-heading text-sm font-semibold group-data-[collapsible=icon]:hidden">
                Zeronix Admin
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Store</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {navItems.map((item) => {
                    const isActive = item.end
                      ? location.pathname === item.to
                      : location.pathname.startsWith(item.to);
                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                          className={cn(
                            "rounded-full",
                            isActive &&
                              "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground data-active:bg-primary data-active:text-primary-foreground",
                          )}
                        >
                          <Link to={item.to}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="View storefront">
                  <Link to="/" target="_blank" rel="noreferrer">
                    <ExternalLink />
                    <span>View storefront</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-muted">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-[10px]">
                      {user ? initials(user.name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-sm font-medium">{user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="h-svh overflow-hidden">
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur-sm">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <Breadcrumb>
              <BreadcrumbList className="flex-nowrap">
                {crumbs.map((crumb, i) => {
                  const isLast = i === crumbs.length - 1;
                  return (
                    <Fragment key={i}>
                      {i > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {isLast || !crumb.to ? (
                          <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={crumb.to}>{crumb.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
            {actions && <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>}
          </header>
          <div className="flex flex-1 flex-col overflow-y-auto p-4 md:p-6">
            <AdminPageChromeContext.Provider value={chrome}>
              <Outlet />
            </AdminPageChromeContext.Provider>
          </div>
          {footer && (
            <div className="sticky bottom-0 z-10 flex shrink-0 items-center border-t bg-background/95 px-4 py-3 backdrop-blur-sm md:px-6">
              {footer}
            </div>
          )}
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </TooltipProvider>
  );
}
