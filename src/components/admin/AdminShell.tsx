import { useState, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Layers,
  Menu as MenuIcon,
  Navigation as NavIcon,
  Globe,
  Image as ImageIcon,
  Film,
  Sparkles,
  Layout,
  Users2,
  Phone,
  Inbox,
  BarChart3,
  MapPin,
  Radio,
  Search,
  Palette,
  ShieldCheck,
  ScrollText,
  Settings,
  Plug,
  DatabaseBackup,
  HelpCircle,
  ParkingSquare,
  Calculator,
  ChevronLeft,
  LogOut,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/lib/admin/auth";
import type { AppRole } from "@/lib/admin/auth";
import { ROLE_LABELS } from "@/lib/admin/roles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles?: AppRole[]; // if undefined, any admin role can see it
  planned?: boolean; // not yet implemented — hidden from the active sidebar
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Website Content",
    items: [
      {
        label: "Website Content",
        to: "/admin/content",
        icon: FileText,
        roles: ["super_admin", "content_editor"],
      },
      {
        label: "Pages & Builder",
        to: "/admin/pages",
        icon: Layers,
        roles: ["super_admin", "content_editor"],
      },
      {
        label: "Navigation",
        to: "/admin/navigation",
        icon: NavIcon,
        roles: ["super_admin"],
      },
      {
        label: "Languages",
        to: "/admin/languages",
        icon: Globe,
        roles: ["super_admin"],
      },
      {
        label: "Media Library",
        to: "/admin/media",
        icon: ImageIcon,
        roles: ["super_admin", "content_editor"],
      },
      { label: "Hero Visual", to: "/admin/hero", icon: Film, roles: ["super_admin"] },
      { label: "Team", to: "/admin/team", icon: Users2, roles: ["super_admin"], planned: true },
      { label: "FAQ", to: "/admin/faq", icon: HelpCircle, roles: ["super_admin"], planned: true },
      {
        label: "Contact Information",
        to: "/admin/contact-info",
        icon: Phone,
        roles: ["super_admin"],
      },
      {
        label: "Economic Feasibility",
        to: "/admin/economic-feasibility",
        icon: Calculator,
        roles: ["super_admin"],
      },
    ],
  },
  {
    label: "Engagement",
    items: [
      {
        label: "Forms & Inquiries",
        to: "/admin/inquiries",
        icon: Inbox,
        roles: ["super_admin", "inquiry_manager"],
      },
    ],
  },
  {
    label: "Analytics",
    items: [
      {
        label: "Analytics",
        to: "/admin/analytics",
        icon: BarChart3,
        roles: ["super_admin", "analytics_viewer"],
      },
      {
        label: "Live Visitors",
        to: "/admin/live-visitors",
        icon: Radio,
        roles: ["super_admin", "analytics_viewer"],
      },
      {
        label: "Visitor Locations",
        to: "/admin/locations",
        icon: MapPin,
        roles: ["super_admin", "analytics_viewer"],
      },
    ],
  },
  {
    label: "SEO & Design",
    items: [
      {
        label: "SEO Manager",
        to: "/admin/seo",
        icon: Search,
        roles: ["super_admin"],
        planned: true,
      },
      { label: "Global Design", to: "/admin/design", icon: Palette, roles: ["super_admin"] },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Users & Roles", to: "/admin/users", icon: ShieldCheck, roles: ["super_admin"] },
      { label: "Audit Logs", to: "/admin/audit", icon: ScrollText, roles: ["super_admin"] },
      { label: "Website Settings", to: "/admin/settings", icon: Settings, roles: ["super_admin"] },
      {
        label: "Integrations",
        to: "/admin/integrations",
        icon: Plug,
        roles: ["super_admin"],
        planned: true,
      },
      {
        label: "Backup & Restore",
        to: "/admin/backup",
        icon: DatabaseBackup,
        roles: ["super_admin"],
        planned: true,
      },
    ],
  },
];

function initials(name?: string | null, email?: string | null) {
  const base = name || email || "A";
  return base
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { profile, user, roles, hasAnyRole, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const primaryRole = roles.includes("super_admin") ? "super_admin" : roles[0];

  const visibleGroups = NAV.map((g) => ({
    ...g,
    items: g.items.filter(
      (i) =>
        !i.planned &&
        (!i.roles || hasAnyRole(i.roles)) &&
        (!search.trim() ||
          `${g.label} ${i.label}`.toLowerCase().includes(search.trim().toLowerCase())),
    ),
  })).filter((g) => g.items.length > 0);

  const isActive = (to: string) =>
    to === "/admin/dashboard"
      ? pathname === "/admin/dashboard" || pathname === "/admin"
      : pathname.startsWith(to);
  const currentLabel = NAV.flatMap((g) => g.items).find((i) => isActive(i.to))?.label ?? "Admin";

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  const Sidebar = (
    <aside
      className={cn(
        "flex h-full flex-col bg-navy text-white transition-[width] duration-300",
        collapsed ? "w-[74px]" : "w-64",
      )}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-primary text-white">
          <ParkingSquare className="h-5 w-5" />
        </span>
        {!collapsed && (
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold">SPM ECO</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-cyan">Admin Panel</span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {visibleGroups.length === 0 && (
          <p className="px-2 text-xs text-white/60">No matching sections.</p>
        )}
        {visibleGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                {group.label}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-white/12 text-white ring-1 ring-white/10"
                          : "text-white/65 hover:bg-white/5 hover:text-white",
                        collapsed && "justify-center px-0",
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon
                        className={cn("h-[18px] w-[18px] shrink-0", active && "text-cyan")}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-white/65 transition-colors hover:bg-white/5 hover:text-white",
            collapsed && "justify-center px-0",
          )}
          title="View public website"
        >
          <ExternalLink className="h-[18px] w-[18px]" />
          {!collapsed && <span>View website</span>}
        </a>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted/40">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">{Sidebar}</div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full">{Sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary lg:hidden"
            aria-label="Open menu"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="hidden h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary lg:grid"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft
              className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")}
            />
          </button>

          <div className="hidden items-center gap-1.5 text-sm sm:flex">
            <span className="text-muted-foreground">Admin</span>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold text-foreground">{currentLabel}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search admin…"
                aria-label="Search admin sections"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-9 w-56 rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-secondary">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-white">
                    {initials(profile?.full_name, profile?.email ?? user?.email)}
                  </span>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-sm font-semibold text-foreground">
                      {profile?.full_name ?? profile?.email ?? user?.email}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {primaryRole ? ROLE_LABELS[primaryRole] : "Admin"}
                    </span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-semibold">{profile?.full_name ?? "Administrator"}</p>
                  <p className="text-xs font-normal text-muted-foreground">
                    {profile?.email ?? user?.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {hasAnyRole(["super_admin"]) && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin/settings">Settings</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
