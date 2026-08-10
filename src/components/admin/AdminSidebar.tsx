"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Star, Mail, LogOut,
  PanelRightClose, PanelRightOpen, Sun, Moon, X, Bug, Settings, Tag,
} from "lucide-react";
import { useTheme } from "@/src/providers/ThemeProvider";
import { fetchDashboard } from "@/src/lib/admin-api";
import { API_BASE } from "@/src/lib/constants";
import { SiteLogo } from "@/src/components/brand/SiteLogo";

interface BadgeCounts {
  pendingOrders: number;
  unreadMessages: number;
  pendingBugs: number;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, badge: "pendingOrders" as const },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/contact-messages", label: "Messages", icon: Mail, badge: "unreadMessages" as const },
  { href: "/admin/bug-reports", label: "Bug Reports", icon: Bug, badge: "pendingBugs" as const },
  { href: "/admin/site-settings", label: "Site Settings", icon: Settings },
];

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ open = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [badges, setBadges] = useState<BadgeCounts>({ pendingOrders: 0, unreadMessages: 0, pendingBugs: 0 });

  useEffect(() => {
    let active = true;
    async function loadBadges() {
      try {
        const data = await fetchDashboard();
        if (active) {
          setBadges({
            pendingOrders: data.stats.pendingOrders,
            unreadMessages: data.stats.unreadMessages,
            pendingBugs: data.stats.pendingBugs,
          });
        }
      } catch {
        // silently fail
      }
    }
    loadBadges();
    const interval = setInterval(loadBadges, 30000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // Best-effort — the server clears the cookie; client redirect happens regardless.
    }
    router.push("/admin/login");
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const isActive = (href: string) => href === "/admin" ? pathname === href : pathname.startsWith(href + "/") || pathname === href;

  const linkClass = (href: string) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive(href)
        ? "bg-brand text-brand-fg shadow-sm"
        : "text-muted hover:text-fg hover:bg-surface-2"
    }`;

  const totalBadges = badges.pendingOrders + badges.unreadMessages + badges.pendingBugs;

  return (
    <>
      {onClose && (
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity lg:hidden ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={onClose}
        />
      )}

      <aside className={`fixed top-0 left-0 h-full bg-surface border-r border-line z-50 transition-all duration-300 flex flex-col ${collapsed ? "w-16" : "w-64"} ${onClose ? (open ? "translate-x-0" : "-translate-x-full lg:translate-x-0") : ""}`}>
        <div className={`border-b border-line ${collapsed ? "p-2 flex flex-col items-center gap-2" : "p-4 flex items-center justify-between gap-2"}`}>
          <Link href="/admin" onClick={handleNavClick} className={`flex items-center min-w-0 ${collapsed ? "" : "gap-2.5"}`} title="Admin">
            <SiteLogo variant="mark" href={null} />
            {!collapsed && (
              <span className="leading-tight">
                <span className="block text-sm font-bold text-fg">Dhaka Wholesale</span>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#E31C23]">Admin</span>
              </span>
            )}
          </Link>
          <div className="flex items-center gap-1">
            {!collapsed && totalBadges > 0 && (
              <span className="mr-1 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5">
                {totalBadges > 99 ? "99+" : totalBadges}
              </span>
            )}
            {onClose && open && (
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-2 transition-colors lg:hidden">
                <X className="w-4 h-4" />
              </button>
            )}
            <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg hover:bg-surface-2 transition-colors hidden lg:block">
              {collapsed ? <PanelRightOpen className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon, badge }) => {
            const count = badge ? badges[badge] : 0;
            return (
              <Link key={href} href={href} onClick={handleNavClick} className={linkClass(href)} title={collapsed ? label : undefined}>
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{label}</span>
                    {count > 0 && (
                      <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5">
                        {count > 99 ? "99+" : count}
                      </span>
                    )}
                  </>
                )}
                {collapsed && count > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-line space-y-1">
          <button onClick={toggleTheme} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-fg hover:bg-surface-2 w-full transition-colors">
            {theme === "dark" ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
            {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger-soft w-full transition-colors">
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
