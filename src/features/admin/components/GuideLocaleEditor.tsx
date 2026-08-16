"use client";

import { Plus, Trash2 } from "lucide-react";

import type {
  BlogFaqItemInput,
  BlogLocaleContentInput,
  BlogSectionInput,
} from "@/features/blog/domain/schemas";
import { adminCopy } from "@/features/admin/copy";
import { AdminField } from "@/features/admin/components/shell/AdminField";
import { AdminFormSection } from "@/features/admin/components/shell/AdminFormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { EnabledLocaleRecord } from "@/features/locales/server/repository";

type GuideLocaleEditorProps = {
  locale: EnabledLocaleRecord;
  value: BlogLocaleContentInput;
  required: boolean;
  embedded?: boolean;
  onChange: (value: BlogLocaleContentInput) => void;
};

function emptySection(): BlogSectionInput {
  return { title: "", paragraphs: [""] };
}

export function GuideLocaleEditor({
  locale,
  value,
  required,
  embedded = false,
  onChange,
}: GuideLocaleEditorProps) {
  const update = (patch: Partial<BlogLocaleContentInput>) => {
    onChange({ ...value, ...patch });
  };

  const updateSection = (index: number, patch: Partial<BlogSectionInput>) => {
    const sections = value.sections.map((section, sectionIndex) =>
      sectionIndex === index ? { ...section, ...patch } : section,
    );
    update({ sections });
  };

  const updateParagraph = (
    sectionIndex: number,
    paragraphIndex: number,
    text: string,
  ) => {
    const sections = value.sections.map((section, index) => {
      if (index !== sectionIndex) {
        return section;
      }

      const paragraphs = section.paragraphs.map((paragraph, pIndex) =>
        pIndex === paragraphIndex ? text : paragraph,
      );

      return { ...section, paragraphs };
    });

    update({ sections });
  };

  const updateTip = (index: number, text: string) => {
    const tips = [...(value.tips ?? [])];
    tips[index] = text;
    update({ tips });
  };

  const updateFaq = (index: number, patch: Partial<BlogFaqItemInput>) => {
    const faq = (value.faq ?? []).map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...patch } : item,
    );
    update({ faq });
  };

  const fields = (
    <div className="space-y-4">
        <AdminField label={adminCopy.guides.form.fields.title} required={required}>
          <Input
            value={value.title}
            onChange={(event) => update({ title: event.target.value })}
            required={required}
          />
        </AdminField>

        <AdminField
          label={adminCopy.guides.form.fields.metaDescription}
          required={required}
        >
          <Textarea
            value={value.metaDescription}
            onChange={(event) => update({ metaDescription: event.target.value })}
            rows={2}
            required={required}
          />
        </AdminField>

        <AdminField label={adminCopy.guides.form.fields.excerpt} required={required}>
          <Textarea
            value={value.excerpt}
            onChange={(event) => update({ excerpt: event.target.value })}
            rows={3}
            required={required}
          />
        </AdminField>

        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField
            label={adminCopy.guides.form.fields.readingMinutes}
            required={required}
          >
            <Input
              type="number"
              min={1}
              max={120}
              value={value.readingMinutes}
              onChange={(event) =>
                update({ readingMinutes: Number(event.target.value) || 1 })
              }
              required={required}
            />
          </AdminField>

          <AdminField
            label={adminCopy.guides.form.fields.coverImageAlt}
            required={required}
          >
            <Input
              value={value.coverImageAlt}
              onChange={(event) => update({ coverImageAlt: event.target.value })}
              required={required}
            />
          </AdminField>
        </div>

        <AdminField label={adminCopy.guides.form.fields.intro} required={required}>
          <Textarea
            value={value.intro}
            onChange={(event) => update({ intro: event.target.value })}
            rows={4}
            required={required}
          />
        </AdminField>

        <AdminField label={adminCopy.guides.form.fields.pullQuote}>
          <Textarea
            value={value.pullQuote ?? ""}
            onChange={(event) =>
              update({ pullQuote: event.target.value || undefined })
            }
            rows={2}
          />
        </AdminField>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">
              {adminCopy.guides.form.fields.sections}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() =>
                update({ sections: [...value.sections, emptySection()] })
              }
            >
              <Plus className="h-4 w-4" aria-hidden />
              {adminCopy.guides.form.addSection}
            </Button>
          </div>

          {value.sections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {adminCopy.guides.form.sectionLabel(sectionIndex + 1)}
                </p>
                {value.sections.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 cursor-pointer text-red-600"
                    onClick={() =>
                      update({
                        sections: value.sections.filter(
                          (_, index) => index !== sectionIndex,
                        ),
                      })
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </Button>
                ) : null}
              </div>

              <AdminField label={adminCopy.guides.form.fields.sectionTitle}>
                <Input
                  value={section.title}
                  onChange={(event) =>
                    updateSection(sectionIndex, { title: event.target.value })
                  }
                />
              </AdminField>

              <div className="space-y-2">
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <div key={paragraphIndex} className="flex gap-2">
                    <Textarea
                      value={paragraph}
                      onChange={(event) =>
                        updateParagraph(
                          sectionIndex,
                          paragraphIndex,
                          event.target.value,
                        )
                      }
                      rows={3}
                      className="min-h-[5rem]"
                    />
                    {section.paragraphs.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 cursor-pointer text-red-600"
                        onClick={() =>
                          updateSection(sectionIndex, {
                            paragraphs: section.paragraphs.filter(
                              (_, index) => index !== paragraphIndex,
                            ),
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    ) : null}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() =>
                    updateSection(sectionIndex, {
                      paragraphs: [...section.paragraphs, ""],
                    })
                  }
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  {adminCopy.guides.form.addParagraph}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">
              {adminCopy.guides.form.fields.tips}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => update({ tips: [...(value.tips ?? []), ""] })}
            >
              <Plus className="h-4 w-4" aria-hidden />
              {adminCopy.guides.form.addTip}
            </Button>
          </div>
          {(value.tips ?? []).map((tip, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={tip}
                onChange={(event) => updateTip(index, event.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 cursor-pointer text-red-600"
                onClick={() =>
                  update({
                    tips: (value.tips ?? []).filter((_, tipIndex) => tipIndex !== index),
                  })
                }
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">
              {adminCopy.guides.form.fields.faq}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() =>
                update({
                  faq: [...(value.faq ?? []), { question: "", answer: "" }],
                })
              }
            >
              <Plus className="h-4 w-4" aria-hidden />
              {adminCopy.guides.form.addFaq}
            </Button>
          </div>
          {(value.faq ?? []).map((item, index) => (
            <div
              key={index}
              className="space-y-2 rounded-xl border border-slate-200 bg-white p-4"
            >
              <AdminField label={adminCopy.guides.form.fields.faqQuestion}>
                <Input
                  value={item.question}
                  onChange={(event) =>
                    updateFaq(index, { question: event.target.value })
                  }
                />
              </AdminField>
              <AdminField label={adminCopy.guides.form.fields.faqAnswer}>
                <Textarea
                  value={item.answer}
                  onChange={(event) =>
                    updateFaq(index, { answer: event.target.value })
                  }
                  rows={3}
                />
              </AdminField>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="cursor-pointer text-red-600"
                onClick={() =>
                  update({
                    faq: (value.faq ?? []).filter((_, faqIndex) => faqIndex !== index),
                  })
                }
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                {adminCopy.guides.form.removeFaq}
              </Button>
            </div>
          ))}
        </div>
      </div>
  );

  if (embedded) {
    return (
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          {required
            ? adminCopy.guides.form.requiredLocaleHint
            : adminCopy.guides.form.optionalLocaleHint}
        </p>
        {fields}
      </div>
    );
  }

  return (
    <AdminFormSection
      title={`${locale.label} (${locale.code.toUpperCase()})`}
      description={
        required
          ? adminCopy.guides.form.requiredLocaleHint
          : adminCopy.guides.form.optionalLocaleHint
      }
      compact
    >
      {fields}
    </AdminFormSection>
  );
}

export function createEmptyGuideLocaleContent(): BlogLocaleContentInput {
  return {
    title: "",
    metaDescription: "",
    excerpt: "",
    readingMinutes: 5,
    intro: "",
    coverImageAlt: "",
    sections: [emptySection()],
    tips: [],
    faq: [],
  };
}
