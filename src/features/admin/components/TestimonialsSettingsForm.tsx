"use client";

import { MessageSquareQuote, Star } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateHomeTestimonialsAction } from "@/features/admin/server/actions";
import type { HomeTestimonialRecord } from "@/features/testimonials/server/repository";
import { formatAuthorInitials } from "@/features/testimonials/domain/format-author-initials";
import { adminCopy, translateAdminError } from "@/features/admin/copy";
import {
  HOME_TESTIMONIAL_SLOT_INDICES,
} from "@/config/home-testimonials";
import { SUPPORTED_LOCALES } from "@/config/locales";
import { AdminContentCard } from "@/features/admin/components/shell/AdminContentCard";
import { AdminField } from "@/features/admin/components/shell/AdminField";
import { AdminFormSection } from "@/features/admin/components/shell/AdminFormSection";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type TestimonialsSettingsFormProps = {
  testimonials: HomeTestimonialRecord[];
};

type TestimonialRowState = {
  clientId: string;
  id?: string;
  locale: string;
  slotIndex: number;
  firstName: string;
  lastName: string;
  quote: string;
  rating: number;
  isActive: boolean;
};

function createClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

function toRowState(record: HomeTestimonialRecord): TestimonialRowState {
  return {
    clientId: record.id || createClientId(),
    id: record.id || undefined,
    locale: record.locale,
    slotIndex: record.slotIndex,
    firstName: record.firstName,
    lastName: record.lastName,
    quote: record.quote,
    rating: record.rating,
    isActive: record.isActive,
  };
}

export function TestimonialsSettingsForm({
  testimonials,
}: TestimonialsSettingsFormProps) {
  const router = useRouter();
  const [rows, setRows] = useState<TestimonialRowState[]>(
    testimonials.map(toRowState),
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeCount = useMemo(
    () =>
      rows.filter(
        (row) => row.isActive && row.quote.trim() && row.firstName.trim(),
      ).length,
    [rows],
  );

  const updateRow = (
    clientId: string,
    patch: Partial<Omit<TestimonialRowState, "clientId">>,
  ) => {
    setRows((current) =>
      current.map((row) =>
        row.clientId === clientId ? { ...row, ...patch } : row,
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

            const result = await updateHomeTestimonialsAction({
              testimonials: rows.map((row) => ({
                id: row.id,
                locale: row.locale,
                slotIndex: row.slotIndex,
                firstName: row.firstName,
                lastName: row.lastName,
                quote: row.quote,
                rating: row.rating,
                isActive: row.isActive,
              })),
            });

            if (!result.success) {
              setError(translateAdminError(result.error.message));
              return;
            }

            setRows(result.data.map(toRowState));
            setSuccess(adminCopy.testimonials.saved);
            router.refresh();
          });
        }}
      >
        <div className="space-y-6 p-4 sm:p-5">
          {error ? <Alert variant="destructive">{error}</Alert> : null}
          {success ? <Alert>{success}</Alert> : null}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-900">
              {adminCopy.testimonials.formTitle}
            </p>
            <p className="text-xs text-muted-foreground">
              {adminCopy.testimonials.summary(activeCount)}
            </p>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            {adminCopy.testimonials.hint}
          </p>

          {SUPPORTED_LOCALES.map((locale) => {
            return (
              <AdminFormSection
                key={locale.code}
                title={`${locale.label} (${locale.shortLabel})`}
                description={adminCopy.testimonials.localeHint}
                icon={MessageSquareQuote}
                compact
              >
                <div className="grid gap-4 lg:grid-cols-3">
                  {HOME_TESTIMONIAL_SLOT_INDICES.map((slotIndex) => {
                    const row = rows.find(
                      (item) =>
                        item.locale === locale.code &&
                        item.slotIndex === slotIndex,
                    );

                    if (!row) {
                      return null;
                    }

                    const initials = formatAuthorInitials(
                      row.firstName,
                      row.lastName,
                    );

                    return (
                      <div
                        key={`${locale.code}-${slotIndex}`}
                        className={cn(
                          "space-y-3 rounded-xl border p-4",
                          row.isActive
                            ? "border-slate-200 bg-white"
                            : "border-slate-200 bg-slate-50/80",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {adminCopy.testimonials.slotLabel(slotIndex + 1)}
                          </p>
                          <span
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700"
                            aria-hidden
                          >
                            {initials}
                          </span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <AdminField
                            label={adminCopy.testimonials.fields.firstName}
                            htmlFor={`${locale.code}-${slotIndex}-first`}
                          >
                            <Input
                              id={`${locale.code}-${slotIndex}-first`}
                              value={row.firstName}
                              onChange={(event) =>
                                updateRow(row.clientId, {
                                  firstName: event.target.value,
                                })
                              }
                              className="h-9"
                            />
                          </AdminField>

                          <AdminField
                            label={adminCopy.testimonials.fields.lastName}
                            htmlFor={`${locale.code}-${slotIndex}-last`}
                          >
                            <Input
                              id={`${locale.code}-${slotIndex}-last`}
                              value={row.lastName}
                              onChange={(event) =>
                                updateRow(row.clientId, {
                                  lastName: event.target.value,
                                })
                              }
                              className="h-9"
                            />
                          </AdminField>
                        </div>

                        <AdminField
                          label={adminCopy.testimonials.fields.rating}
                          htmlFor={`${locale.code}-${slotIndex}-rating`}
                        >
                          <div className="flex flex-wrap gap-1.5">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                type="button"
                                className={cn(
                                  "flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border text-sm transition-colors",
                                  row.rating >= rating
                                    ? "border-amber-300 bg-amber-50 text-amber-600"
                                    : "border-slate-200 bg-white text-slate-400 hover:border-amber-200",
                                )}
                                onClick={() =>
                                  updateRow(row.clientId, { rating })
                                }
                                aria-label={adminCopy.testimonials.ratingAria(
                                  rating,
                                )}
                              >
                                <Star
                                  className={cn(
                                    "h-4 w-4",
                                    row.rating >= rating && "fill-current",
                                  )}
                                  aria-hidden
                                />
                              </button>
                            ))}
                          </div>
                        </AdminField>

                        <AdminField
                          label={adminCopy.testimonials.fields.quote}
                          htmlFor={`${locale.code}-${slotIndex}-quote`}
                        >
                          <Textarea
                            id={`${locale.code}-${slotIndex}-quote`}
                            value={row.quote}
                            onChange={(event) =>
                              updateRow(row.clientId, {
                                quote: event.target.value,
                              })
                            }
                            rows={4}
                            className="min-h-[6.5rem] resize-y"
                          />
                        </AdminField>

                        <label
                          className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"
                        >
                          <input
                            type="checkbox"
                            checked={row.isActive}
                            onChange={(event) =>
                              updateRow(row.clientId, {
                                isActive: event.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          {adminCopy.testimonials.fields.active}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </AdminFormSection>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 px-4 py-3 sm:px-5">
          <p className="text-xs text-slate-500">
            {adminCopy.testimonials.saveHint}
          </p>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? adminCopy.testimonials.saving
              : adminCopy.testimonials.save}
          </Button>
        </div>
      </form>
    </AdminContentCard>
  );
}
