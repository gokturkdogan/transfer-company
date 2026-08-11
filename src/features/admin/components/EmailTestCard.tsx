"use client";

import { Eye, Mail } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { sendMockReservationEmailAction } from "@/features/admin/server/notification-test-actions";
import { AdminContentCard } from "@/features/admin/components/shell/AdminContentCard";
import { adminCopy, translateAdminError } from "@/features/admin/copy";

export function EmailTestCard() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSend = () => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await sendMockReservationEmailAction({});

      if (!result.success) {
        setError(translateAdminError(result.error.message));
        return;
      }

      setSuccess(
        adminCopy.contact.emailTest.success(
          result.data.customerRecipient,
          result.data.adminRecipient,
        ),
      );
    });
  };

  return (
    <AdminContentCard
      title={adminCopy.contact.emailTest.title}
      description={adminCopy.contact.emailTest.description}
    >
      <div className="space-y-4">
        {error ? <Alert variant="destructive">{error}</Alert> : null}
        {success ? <Alert>{success}</Alert> : null}

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={handleSend}
            disabled={isPending}
            className="gap-2"
          >
            <Mail className="size-4" />
            {isPending
              ? adminCopy.contact.emailTest.sending
              : adminCopy.contact.emailTest.button}
          </Button>

          <Button type="button" variant="outline" className="gap-2" asChild>
            <Link href="/admin/contact/email-preview">
              <Eye className="size-4" />
              {adminCopy.contact.emailTest.openPreview}
            </Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          {adminCopy.contact.emailTest.hint}
        </p>
      </div>
    </AdminContentCard>
  );
}
