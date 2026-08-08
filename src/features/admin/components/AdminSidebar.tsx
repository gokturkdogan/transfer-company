"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/features/admin/server/actions";
import type { AdminSessionUser } from "@/features/admin/server/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/locations", label: "Locations" },
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/reservations", label: "Reservations" },
] as const;

export function AdminSidebar({ admin }: { admin: AdminSessionUser }) {
  const currentPath = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-muted/30">
      <div className="border-b border-border p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Admin
        </p>
        <h1 className="text-lg font-semibold">Transfer Company</h1>
        <p className="mt-1 text-sm text-muted-foreground">{admin.name}</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              currentPath.startsWith(item.href)
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <form action={logoutAction} className="border-t border-border p-4">
        <Button type="submit" variant="outline" className="w-full">
          Sign out
        </Button>
      </form>
    </aside>
  );
}
