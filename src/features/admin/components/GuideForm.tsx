"use client";

import { BookOpen, Hash, Settings2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";


import {
  createGuideAction,
  updateGuideAction,
} from "@/features/admin/server/actions";
import type { AdminGuideDetailRecord } from "@/features/blog/server/repository";
import type { BlogLocaleContentInput } from "@/features/blog/domain/schemas";
import { BlogCoverImageUploadField } from "@/features/admin/components/BlogCoverImageUploadField";
import {
  createEmptyGuideLocaleContent,
} from "@/features/admin/components/GuideLocaleEditor";
import { GuideLocaleTabs } from "@/features/admin/components/GuideLocaleTabs";
import { GuideDeleteButton } from "@/features/admin/components/GuideDeleteButton";
import { adminCopy, translateAdminError } from "@/features/admin/copy";
import { AdminField } from "@/features/admin/components/shell/AdminField";
import {
  AdminFormGrid,
  AdminFormRow,
  AdminFormStack,
} from "@/features/admin/components/shell/AdminFormLayout";
import { AdminFormSection } from "@/features/admin/components/shell/AdminFormSection";
import { AdminFormShell } from "@/features/admin/components/shell/AdminFormShell";
import { AdminSelect } from "@/features/admin/components/shell/AdminSelect";
import { AdminToggleField } from "@/features/admin/components/shell/AdminToggleField";
import type { EnabledLocaleRecord } from "@/features/locales/server/repository";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DistrictOption = {
  code: string;
  name: string;
};

type GuideFormProps = {
  mode: "create" | "edit";
  guide?: AdminGuideDetailRecord;
  enabledLocales: EnabledLocaleRecord[];
  districts: DistrictOption[];
};

function buildTranslationState(
  enabledLocales: EnabledLocaleRecord[],
  seed?: Record<string, BlogLocaleContentInput>,
): Record<string, BlogLocaleContentInput> {
  return Object.fromEntries(
    enabledLocales.map((locale) => [
      locale.code,
      seed?.[locale.code] ?? createEmptyGuideLocaleContent(),
    ]),
  );
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function GuideForm({
  mode,
  guide,
  enabledLocales,
  districts,
}: GuideFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [slug, setSlug] = useState(guide?.slug ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(guide?.coverImageUrl ?? "");
  const [translations, setTranslations] = useState(() =>
    buildTranslationState(enabledLocales, guide?.translations),
  );

  const defaultPublishedAt = useMemo(() => {
    if (guide?.publishedAt) {
      return guide.publishedAt;
    }

    return new Date().toISOString().slice(0, 10);
  }, [guide?.publishedAt]);

  return (
    <AdminFormShell
      error={error}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const normalizedSlug = normalizeSlug(slug);

        const payload = {
          slug: normalizedSlug,
          publishedAt: String(formData.get("publishedAt")),
          coverImageUrl,
          transferDistrictCode: String(formData.get("transferDistrictCode") || ""),
          sortOrder: formData.get("sortOrder"),
          isActive: formData.get("isActive") === "on",
          translations: enabledLocales.map((locale) => ({
            locale: locale.code,
            ...translations[locale.code],
            tips:
              translations[locale.code].tips?.filter((tip) => tip.trim()) ?? [],
            faq:
              translations[locale.code].faq?.filter(
                (item) => item.question.trim() && item.answer.trim(),
              ) ?? [],
            sections: translations[locale.code].sections
              .map((section) => ({
                title: section.title.trim(),
                paragraphs: section.paragraphs
                  .map((paragraph) => paragraph.trim())
                  .filter(Boolean),
              }))
              .filter(
                (section) => section.title && section.paragraphs.length > 0,
              ),
          })),
        };

        startTransition(async () => {
          setError(null);

          const result =
            mode === "create"
              ? await createGuideAction(payload)
              : await updateGuideAction({ ...payload, id: guide!.id });

          if (!result.success) {
            setError(translateAdminError(result.error.message));
            return;
          }

          router.push(`/admin/guides/${result.data.id}/edit`);
          router.refresh();
        });
      }}
      actions={
        <>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? adminCopy.guides.form.saving
              : mode === "create"
                ? adminCopy.guides.form.create
                : adminCopy.guides.form.save}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => router.push("/admin/guides")}
          >
            {adminCopy.common.back}
          </Button>
          {mode === "edit" && guide ? (
            <GuideDeleteButton
              guideId={guide.id}
              guideTitle={guide.title}
              redirectToList
              size="default"
              className="ml-auto"
            />
          ) : null}
        </>
      }
    >
      <AdminFormStack>
        <AdminFormSection
          title={adminCopy.guides.form.generalTitle}
          description={adminCopy.guides.form.generalHint}
          icon={BookOpen}
        >
          <AdminFormGrid>
            <AdminField label={adminCopy.guides.form.fields.slug} required>
              <Input
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                onBlur={() => setSlug((current) => normalizeSlug(current))}
                placeholder={adminCopy.guides.form.slugPlaceholder}
                required
              />
            </AdminField>

            <AdminField label={adminCopy.guides.form.fields.publishedAt} required>
              <Input
                name="publishedAt"
                type="date"
                defaultValue={defaultPublishedAt}
                required
              />
            </AdminField>

            <AdminField label={adminCopy.guides.form.fields.sortOrder}>
              <Input
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={guide?.sortOrder ?? 0}
              />
            </AdminField>

            <AdminField label={adminCopy.guides.form.fields.transferDistrict}>
              <AdminSelect name="transferDistrictCode" defaultValue={guide?.transferDistrictCode ?? ""}>
                <option value="">{adminCopy.guides.form.noDistrict}</option>
                {districts.map((district) => (
                  <option key={district.code} value={district.code}>
                    {district.name} ({district.code})
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
          </AdminFormGrid>

          <BlogCoverImageUploadField
            label={adminCopy.guides.form.fields.coverImage}
            hint={adminCopy.guides.form.cropHint}
            value={coverImageUrl}
            slug={slug}
            onChange={setCoverImageUrl}
          />
        </AdminFormSection>

        <AdminFormSection
          title={adminCopy.guides.form.contentTitle}
          icon={Hash}
        >
          <GuideLocaleTabs
            enabledLocales={enabledLocales}
            translations={translations}
            onTranslationChange={(localeCode, value) =>
              setTranslations((current) => ({
                ...current,
                [localeCode]: value,
              }))
            }
          />
        </AdminFormSection>

        <AdminFormSection
          title={adminCopy.guides.form.settingsTitle}
          icon={Settings2}
          compact
        >
          <AdminFormRow>
            <AdminToggleField
              name="isActive"
              label={adminCopy.guides.form.fields.active}
              defaultChecked={guide?.isActive ?? false}
            />
          </AdminFormRow>
        </AdminFormSection>
      </AdminFormStack>
    </AdminFormShell>
  );
}
