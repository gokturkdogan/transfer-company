"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteExtraAction } from "@/features/admin/server/actions";
import { adminCopy, translateAdminError } from "@/features/admin/copy";
import { Button } from "@/components/ui/button";

type ExtraDeleteButtonProps = {
  extraId: string;
  extraName: string;
  redirectToList?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export function ExtraDeleteButton({
  extraId,
  extraName,
  redirectToList = false,
  size = "sm",
  className,
}: ExtraDeleteButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(adminCopy.extras.delete.confirm(extraName))) {
      return;
    }

    startTransition(async () => {
      setError(null);

      const result = await deleteExtraAction({ id: extraId });

      if (!result.success) {
        setError(translateAdminError(result.error.message));
        return;
      }

      if (redirectToList) {
        router.push("/admin/extras");
        router.refresh();
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className={className}>
      {error ? (
        <p className="mb-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        variant="destructive"
        size={size}
        disabled={isPending}
        onClick={handleDelete}
      >
        {isPending ? adminCopy.extras.delete.deleting : adminCopy.extras.delete.button}
      </Button>
    </div>
  );
}

type ExtraTableActionsProps = {
  extraId: string;
  extraName: string;
};

export function ExtraTableActions({ extraId, extraName }: ExtraTableActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href={`/admin/extras/${extraId}/edit`}>
          {adminCopy.extras.table.edit}
        </Link>
      </Button>
      <ExtraDeleteButton extraId={extraId} extraName={extraName} />
    </div>
  );
}
