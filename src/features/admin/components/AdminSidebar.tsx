"use client";

import {
  Banknote,
  CalendarCheck,
  Car,
  Coins,
  Languages,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquareQuote,
  PackagePlus,
  Phone,
  Share2,
  Shield,
  TableProperties,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/features/admin/server/actions";
import type { AdminSessionUser } from "@/features/admin/server/auth";
import { adminCopy } from "@/features/admin/copy";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: adminCopy.sidebar.dashboard,
    exact: true,
    icon: LayoutDashboard,
  },
  {
    href: "/admin/locations",
    label: adminCopy.sidebar.locations,
    icon: MapPin,
  },
  {
    href: "/admin/extras",
    label: adminCopy.sidebar.extras,
    icon: PackagePlus,
  },
  {
    href: "/admin/vehicles",
    label: adminCopy.sidebar.vehicles,
    icon: Car,
  },
  {
    href: "/admin/pricing",
    label: adminCopy.sidebar.pricing,
    icon: TableProperties,
  },
  {
    href: "/admin/currencies",
    label: adminCopy.sidebar.currencies,
    icon: Coins,
  },
  {
    href: "/admin/reservations",
    label: adminCopy.sidebar.reservations,
    icon: CalendarCheck,
  },
  {
    href: "/admin/contact",
    label: adminCopy.sidebar.contact,
    icon: Phone,
  },
  {
    href: "/admin/social-media",
    label: adminCopy.sidebar.socialMedia,
    icon: Share2,
  },
  {
    href: "/admin/testimonials",
    label: adminCopy.sidebar.testimonials,
    icon: MessageSquareQuote,
  },
  {
    href: "/admin/locales",
    label: adminCopy.sidebar.locales,
    icon: Languages,
  },
] as const;

export function AdminSidebar({ admin }: { admin: AdminSessionUser }) {
  const currentPath = usePathname();

  return (
    <aside className="admin-sidebar fixed inset-y-0 left-0 z-40 flex h-screen w-[var(--admin-sidebar-width)] flex-col bg-[var(--admin-sidebar)] text-white">
      <div className="border-b border-white/10 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-900/40">
            <Shield className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200/80">
              {adminCopy.brand.panel}
            </p>
            <h1 className="text-sm font-semibold leading-tight">
              {adminCopy.brand.title}
            </h1>
          </div>
        </div>
        <p className="mt-4 truncate rounded-md bg-white/5 px-3 py-2 text-xs text-slate-300">
          {admin.name}
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            "exact" in item && item.exact
              ? currentPath === item.href
              : currentPath.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-[var(--admin-sidebar-active)] text-white shadow-md shadow-blue-900/30"
                  : "text-slate-300 hover:bg-[var(--admin-sidebar-hover)] hover:text-white",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-white" : "text-slate-400",
                )}
                aria-hidden
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <form action={logoutAction} className="border-t border-white/10 p-3">
        <Button
          type="submit"
          variant="outline"
          className="w-full border-white/20 bg-transparent text-slate-200 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          {adminCopy.sidebar.signOut}
        </Button>
      </form>
    </aside>
  );
}
