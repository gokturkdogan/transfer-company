import { Phone } from "lucide-react";

import { db } from "@/db/client";
import { ContactSettingsForm } from "@/features/admin/components/ContactSettingsForm";
import { AdminPageHeader } from "@/features/admin/components/shell/AdminPageHeader";
import { adminCopy } from "@/features/admin/copy";
import { ContactChannelRepository } from "@/features/contact/server/repository";

const contactChannelRepository = new ContactChannelRepository(db);

export default async function AdminContactPage() {
  const channels = await contactChannelRepository.listAll();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={adminCopy.contact.title}
        subtitle={adminCopy.contact.subtitle}
        icon={Phone}
      />

      <ContactSettingsForm channels={channels} />
    </div>
  );
}
