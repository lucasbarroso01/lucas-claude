"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  GitBranch,
  Share2,
  ShoppingBag,
  XCircle,
  Kanban,
  Play,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/leads/buyers", label: "Compradores", icon: ShoppingBag },
  { href: "/leads/non-buyers", label: "Não Compradores", icon: XCircle },
  { href: "/distribution", label: "Distribuição", icon: Share2 },
  { href: "/funnel", label: "Funil de Vendas", icon: Kanban },
  { href: "/attendants", label: "Atendentes", icon: GitBranch },
  { href: "/campaigns", label: "Campanhas", icon: Megaphone },
  { href: "/simulation", label: "Simulação", icon: Play },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "Bella Modas";

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out h-screen sticky top-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo / Store Name */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border min-h-[64px]">
        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Heart className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-sm text-foreground truncate">{storeName}</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* CRM Badge */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            CRM · WhatsApp Leads
          </p>
        </div>
      )}

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors z-10 shadow-sm"
        aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
