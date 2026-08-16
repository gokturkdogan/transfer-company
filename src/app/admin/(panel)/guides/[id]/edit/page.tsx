import { BookOpen } from "lucide-react";
import { notFound } from "next/navigation";

import { db } from "@/db/client";
import { GuideForm } from "@/features/admin/components/GuideForm";
import { AdminFormPage } from "@/features/admin/components/shell/AdminFormPage";
import { adminCopy } from "@/features/admin/copy";
import { LocationAdminRepository } from "@/features/admin/server/location-admin-repository";
import { BlogPostRepository } from "@/features/blog/server/repository";
import { LocaleRepository } from "@/features/locales/server/repository";

const blogPostRepository = new BlogPostRepository(db);
const localeRepository = new LocaleRepository(db);
const locationAdminRepository = new LocationAdminRepository(db);

type PageParams = {
  params: Promise<{ id: string }>;
};

export default async function EditGuidePage({ params }: PageParams) {
  const { id } = await params;
  const [guide, enabledLocales, districts] = await Promise.all([
    blogPostRepository.getByIdForAdmin(id),
    localeRepository.listActive(),
    locationAdminRepository.findByType("DISTRICT", { includeInactive: false }),
  ]);

  if (!guide) {
    notFound();
  }

  return (
    <AdminFormPage
      title={adminCopy.guides.editTitle}
      subtitle={guide.title}
      icon={BookOpen}
      backHref="/admin/guides"
    >
      <GuideForm
        mode="edit"
        guide={guide}
        enabledLocales={enabledLocales}
        districts={districts.map((district) => ({
          code: district.code,
          name: district.defaultName,
        }))}
      />
    </AdminFormPage>
  );
}
