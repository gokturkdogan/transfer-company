"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteGuideAction } from "@/features/admin/server/actions";
import { adminCopy, translateAdminError } from "@/features/admin/copy";
import { Button } from "@/components/ui/button";

type GuideDeleteButtonProps = {
  guideId: string;
  guideTitle: string;
  redirectToList?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export function GuideDeleteButton({
  guideId,
  guideTitle,
  redirectToList = false,
  size = "sm",
  className,
}: GuideDeleteButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(adminCopy.guides.delete.confirm(guideTitle))) {
      return;
    }

    startTransition(async () => {
      setError(null);

      const result = await deleteGuideAction({ id: guideId });

      if (!result.success) {
        setError(translateAdminError(result.error.message));
        return;
      }

      if (redirectToList) {
        router.push("/admin/guides");
        router.refresh();
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant="destructive"
        size={size}
        className="cursor-pointer"
        disabled={isPending}
        onClick={handleDelete}
      >
        {adminCopy.guides.delete.action}
      </Button>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export function GuideTableActions({
  guideId,
  guideTitle,
}: {
  guideId: string;
  guideTitle: string;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button asChild variant="outline" size="sm" className="cursor-pointer">
        <Link href={`/admin/guides/${guideId}/edit`}>
          {adminCopy.guides.table.edit}
        </Link>
      </Button>
      <GuideDeleteButton guideId={guideId} guideTitle={guideTitle} />
    </div>
  );
}
