"use client";

import { Link2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateFooterBacklinksAction } from "@/features/admin/server/actions";
import type { FooterBacklinkRecord } from "@/features/footer-backlinks/server/repository";
import { adminCopy, translateAdminError } from "@/features/admin/copy";
import { AdminContentCard } from "@/features/admin/components/shell/AdminContentCard";
import { AdminFormSection } from "@/features/admin/components/shell/AdminFormSection";
import {
  FOOTER_BACKLINK_SLOT_COUNT,
  FOOTER_BACKLINK_SLOT_INDICES,
  type FooterBacklinkSlotIndex,
} from "@/config/footer-backlinks";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type FooterBacklinksSettingsFormProps = {
  links: FooterBacklinkRecord[];
};

type LinkRowState = {
  slotIndex: FooterBacklinkSlotIndex;
  label: string;
  url: string;
  isActive: boolean;
};

function toRowState(link: FooterBacklinkRecord): LinkRowState {
  return {
    slotIndex: link.slotIndex,
    label: link.label,
    url: link.url,
    isActive: link.isActive,
  };
}

export function FooterBacklinksSettingsForm({
  links,
}: FooterBacklinksSettingsFormProps) {
  const router = useRouter();
  const [rows, setRows] = useState<LinkRowState[]>(
    FOOTER_BACKLINK_SLOT_INDICES.map((slotIndex) => {
      const existing = links.find((link) => link.slotIndex === slotIndex);
      return existing
        ? toRowState(existing)
        : { slotIndex, label: "", url: "", isActive: false };
    }),
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeCount = useMemo(
    () =>
      rows.filter(
        (row) => row.isActive && row.url.trim() && row.label.trim(),
      ).length,
    [rows],
  );

  const updateRow = (
    slotIndex: FooterBacklinkSlotIndex,
    patch: Partial<Pick<LinkRowState, "label" | "url" | "isActive">>,
  ) => {
    setRows((current) =>
      current.map((row) =>
        row.slotIndex === slotIndex ? { ...row, ...patch } : row,
      ),
    );
  };

  return (
    <AdminContentCard flush>
      <form
        className="divide-y divide-slate-100"
        onSubmit={(event) => {
          event.preventDefault();

          startTransition(async () => {
            setError(null);
            setSuccess(null);

            const result = await updateFooterBacklinksAction({
              links: rows.map((row) => ({
                slotIndex: row.slotIndex,
                label: row.label,
                url: row.url,
                isActive: row.isActive,
              })),
            });

            if (!result.success) {
              setError(translateAdminError(result.error.message));
              return;
            }

            setRows(
              FOOTER_BACKLINK_SLOT_INDICES.map((slotIndex) => {
                const saved = result.data.find(
                  (link) => link.slotIndex === slotIndex,
                );
                return saved
                  ? toRowState(saved)
                  : { slotIndex, label: "", url: "", isActive: false };
              }),
            );
            setSuccess(adminCopy.footerBacklinks.saved);
            router.refresh();
          });
        }}
      >
        <div className="space-y-4 p-4 sm:p-5">
          {error ? <Alert variant="destructive">{error}</Alert> : null}
          {success ? <Alert>{success}</Alert> : null}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-900">
              {adminCopy.footerBacklinks.formTitle}
            </p>
            <p className="text-xs text-muted-foreground">
              {adminCopy.footerBacklinks.summary(
                activeCount,
                FOOTER_BACKLINK_SLOT_COUNT,
              )}
            </p>
          </div>

          <div className="grid gap-4">
            {rows.map((row) => (
              <AdminFormSection
                key={row.slotIndex}
                title={adminCopy.footerBacklinks.slotTitle(row.slotIndex + 1)}
                icon={Link2}
                compact
                className="h-full"
              >
                <div
                  className={cn(
                    "space-y-3 rounded-xl border p-3 transition-colors",
                    row.isActive && row.url.trim() && row.label.trim()
                      ? "border-slate-200 bg-white"
                      : "border-slate-200 bg-slate-50/80",
                  )}
                >
                  <Input
                    value={row.label}
                    onChange={(event) =>
                      updateRow(row.slotIndex, { label: event.target.value })
                    }
                    placeholder={adminCopy.footerBacklinks.placeholders.label}
                    aria-label={adminCopy.footerBacklinks.fields.label}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      value={row.url}
                      onChange={(event) =>
                        updateRow(row.slotIndex, { url: event.target.value })
                      }
                      placeholder={adminCopy.footerBacklinks.placeholders.url}
                      className="min-w-0 flex-1"
                      aria-label={adminCopy.footerBacklinks.fields.url}
                    />

                    <label
                      className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-600"
                      title={adminCopy.footerBacklinks.fields.active}
                    >
                      <input
                        type="checkbox"
                        checked={row.isActive}
                        onChange={(event) =>
                          updateRow(row.slotIndex, {
                            isActive: event.target.checked,
                          })
                        }
                        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="hidden sm:inline">
                        {adminCopy.footerBacklinks.fields.active}
                      </span>
                    </label>
                  </div>
                </div>
              </AdminFormSection>
            ))}
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            {adminCopy.footerBacklinks.hint}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 px-4 py-3 sm:px-5">
          <p className="text-xs text-slate-500">
            {adminCopy.footerBacklinks.saveHint}
          </p>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? adminCopy.footerBacklinks.saving
              : adminCopy.footerBacklinks.save}
          </Button>
        </div>
      </form>
    </AdminContentCard>
  );
}
