import { MessageSquareQuote } from "lucide-react";

import { db } from "@/db/client";
import { TestimonialsSettingsForm } from "@/features/admin/components/TestimonialsSettingsForm";
import { AdminPageHeader } from "@/features/admin/components/shell/AdminPageHeader";
import { adminCopy } from "@/features/admin/copy";
import { HomeTestimonialRepository } from "@/features/testimonials/server/repository";

const homeTestimonialRepository = new HomeTestimonialRepository(db);

export default async function AdminTestimonialsPage() {
  const testimonials = await homeTestimonialRepository.listAllForAdmin();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={adminCopy.testimonials.title}
        subtitle={adminCopy.testimonials.subtitle}
        icon={MessageSquareQuote}
      />

      <TestimonialsSettingsForm testimonials={testimonials} />
    </div>
  );
}
