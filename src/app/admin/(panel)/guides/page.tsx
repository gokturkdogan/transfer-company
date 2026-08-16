import Link from "next/link";
import { BookOpen } from "lucide-react";

import { db } from "@/db/client";
import { GuideTableActions } from "@/features/admin/components/GuideDeleteButton";
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
import { adminCopy } from "@/features/admin/copy";
import { BlogPostRepository } from "@/features/blog/server/repository";

const blogPostRepository = new BlogPostRepository(db);

export default async function AdminGuidesPage() {
  const guides = await blogPostRepository.listForAdmin();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={adminCopy.guides.title}
        subtitle={adminCopy.guides.subtitle}
        icon={BookOpen}
        actions={
          <Button asChild size="sm">
            <Link href="/admin/guides/new">{adminCopy.guides.addNew}</Link>
          </Button>
        }
      />

      <AdminContentCard title={adminCopy.guides.listTitle} flush>
        <Table className="admin-table">
          <TableHeader>
            <TableRow>
              <TableHead>{adminCopy.guides.table.title}</TableHead>
              <TableHead>{adminCopy.guides.table.slug}</TableHead>
              <TableHead>{adminCopy.guides.table.publishedAt}</TableHead>
              <TableHead>{adminCopy.guides.table.sortOrder}</TableHead>
              <TableHead>{adminCopy.guides.table.status}</TableHead>
              <TableHead className="text-right">
                {adminCopy.guides.table.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guides.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-500">
                  {adminCopy.guides.empty}
                </TableCell>
              </TableRow>
            ) : (
              guides.map((guide) => (
                <TableRow key={guide.id}>
                  <TableCell className="font-medium">{guide.title}</TableCell>
                  <TableCell>{guide.slug}</TableCell>
                  <TableCell>{guide.publishedAt}</TableCell>
                  <TableCell>{guide.sortOrder}</TableCell>
                  <TableCell>
                    <Badge variant={guide.isActive ? "success" : "destructive"}>
                      {guide.isActive
                        ? adminCopy.locations.status.active
                        : adminCopy.locations.status.inactive}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <GuideTableActions
                      guideId={guide.id}
                      guideTitle={guide.title}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminContentCard>
    </div>
  );
}
