import Link from "next/link";
import { PackagePlus } from "lucide-react";

import { db } from "@/db/client";
import { ExtraAdminRepository } from "@/features/admin/server/extra-admin-repository";
import { ExtraTableActions } from "@/features/admin/components/ExtraDeleteButton";
import { AdminContentCard } from "@/features/admin/components/shell/AdminContentCard";
import { AdminPageHeader } from "@/features/admin/components/shell/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ADMIN_LOCALE,
  adminCopy,
  formatExtraPricingMode,
} from "@/features/admin/copy";
import { createMoney, formatMoney } from "@/lib/money";

const extraAdminRepository = new ExtraAdminRepository(db);

export default async function AdminExtrasPage() {
  const extras = await extraAdminRepository.list(true);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={adminCopy.extras.title}
        subtitle={adminCopy.extras.subtitle}
        icon={PackagePlus}
        actions={
          <Button asChild size="sm">
            <Link href="/admin/extras/new">{adminCopy.extras.addNew}</Link>
          </Button>
        }
      />

      <AdminContentCard title={adminCopy.extras.title} flush>
        <Table className="admin-table">
            <TableHeader>
              <TableRow>
                <TableHead>{adminCopy.extras.table.name}</TableHead>
                <TableHead>{adminCopy.extras.table.code}</TableHead>
                <TableHead>{adminCopy.extras.table.pricingMode}</TableHead>
                <TableHead>{adminCopy.extras.table.prices}</TableHead>
                <TableHead>{adminCopy.extras.table.status}</TableHead>
                <TableHead className="text-right">
                  {adminCopy.extras.table.actions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extras.map((extra) => (
                <TableRow key={extra.id}>
                  <TableCell className="font-medium">{extra.name}</TableCell>
                  <TableCell>{extra.code}</TableCell>
                  <TableCell>
                    {formatExtraPricingMode(extra.pricingMode)}
                  </TableCell>
                  <TableCell>
                    {extra.prices.length > 0
                      ? extra.prices
                          .map((price) =>
                            formatMoney(
                              createMoney(price.priceMinor, price.currency),
                              ADMIN_LOCALE,
                            ),
                          )
                          .join(" · ")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={extra.isActive ? "success" : "destructive"}
                    >
                      {extra.isActive
                        ? adminCopy.locations.status.active
                        : adminCopy.locations.status.inactive}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ExtraTableActions extraId={extra.id} extraName={extra.name} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
        </Table>
      </AdminContentCard>
    </div>
  );
}
