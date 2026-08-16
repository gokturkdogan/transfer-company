import { Share2 } from "lucide-react";

import { db } from "@/db/client";
import { SocialMediaSettingsForm } from "@/features/admin/components/SocialMediaSettingsForm";
import { AdminPageHeader } from "@/features/admin/components/shell/AdminPageHeader";
import { adminCopy } from "@/features/admin/copy";
import { SocialMediaRepository } from "@/features/social-media/server/repository";

const socialMediaRepository = new SocialMediaRepository(db);

export default async function AdminSocialMediaPage() {
  const links = await socialMediaRepository.listAll();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={adminCopy.socialMedia.title}
        subtitle={adminCopy.socialMedia.subtitle}
        icon={Share2}
      />

      <SocialMediaSettingsForm links={links} />
    </div>
  );
}
