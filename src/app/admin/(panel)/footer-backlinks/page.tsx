import { Link2 } from "lucide-react";

import { db } from "@/db/client";
import { FooterBacklinksSettingsForm } from "@/features/admin/components/FooterBacklinksSettingsForm";
import { AdminPageHeader } from "@/features/admin/components/shell/AdminPageHeader";
import { adminCopy } from "@/features/admin/copy";
import { FooterBacklinksRepository } from "@/features/footer-backlinks/server/repository";

const footerBacklinksRepository = new FooterBacklinksRepository(db);

export default async function AdminFooterBacklinksPage() {
  const links = await footerBacklinksRepository.listAll();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={adminCopy.footerBacklinks.title}
        subtitle={adminCopy.footerBacklinks.subtitle}
        icon={Link2}
      />

      <FooterBacklinksSettingsForm links={links} />
    </div>
  );
}
