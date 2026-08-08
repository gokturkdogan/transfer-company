import { ArrowLeft, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { adminCopy } from "@/features/admin/copy";
import { AdminPageHeader } from "@/features/admin/components/shell/AdminPageHeader";
import { Button } from "@/components/ui/button";

type AdminFormPageProps = {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  backHref: string;
  backLabel?: string;
  children: ReactNode;
};

export function AdminFormPage({
  title,
  subtitle,
  icon,
  backHref,
  backLabel = adminCopy.common.back,
  children,
}: AdminFormPageProps) {
  return (
    <div className="space-y-5">
      <AdminPageHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {backLabel}
            </Link>
          </Button>
        }
      />
      {children}
    </div>
  );
}
