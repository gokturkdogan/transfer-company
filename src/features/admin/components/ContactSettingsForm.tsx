"use client";

import type { ComponentType, SVGProps } from "react";
import {
  Mail,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateContactChannelsAction } from "@/features/admin/server/actions";
import type { ContactChannelRecord } from "@/features/contact/server/repository";
import { adminCopy, translateAdminError } from "@/features/admin/copy";
import { AdminContentCard } from "@/features/admin/components/shell/AdminContentCard";
import { AdminFormSection } from "@/features/admin/components/shell/AdminFormSection";
import type { ContactChannelType } from "@/features/admin/lib/public-enums";
import { CONTACT_CHANNEL_TYPES } from "@/features/admin/lib/public-enums";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { cn } from "@/lib/utils";

type ContactRowState = {
  clientId: string;
  id?: string;
  type: ContactChannelType;
  value: string;
  isActive: boolean;
};

type ContactSettingsFormProps = {
  channels: ContactChannelRecord[];
};

const SECTION_CONFIG: Record<
  ContactChannelType,
  {
    title: string;
    description: string;
    addLabel: string;
    placeholder: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
  }
> = {
  EMAIL: {
    title: adminCopy.contact.sections.email,
    description: adminCopy.contact.sectionHints.email,
    addLabel: adminCopy.contact.addEmail,
    placeholder: adminCopy.contact.placeholders.email,
    icon: Mail,
  },
  PHONE: {
    title: adminCopy.contact.sections.phone,
    description: adminCopy.contact.sectionHints.phone,
    addLabel: adminCopy.contact.addPhone,
    placeholder: adminCopy.contact.placeholders.phone,
    icon: Phone,
  },
  WHATSAPP: {
    title: adminCopy.contact.sections.whatsapp,
    description: adminCopy.contact.sectionHints.whatsapp,
    addLabel: adminCopy.contact.addWhatsapp,
    placeholder: adminCopy.contact.placeholders.whatsapp,
    icon: WhatsAppIcon,
  },
};

function createClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

function toRowState(channel: ContactChannelRecord): ContactRowState {
  return {
    clientId: channel.id,
    id: channel.id,
    type: channel.type,
    value: channel.value,
    isActive: channel.isActive,
  };
}

function createEmptyRow(type: ContactChannelType): ContactRowState {
  return {
    clientId: createClientId(),
    type,
    value: "",
    isActive: true,
  };
}

type ContactChannelSectionProps = {
  type: ContactChannelType;
  rows: ContactRowState[];
  onAdd: () => void;
  onUpdate: (
    clientId: string,
    patch: Partial<Pick<ContactRowState, "value" | "isActive">>,
  ) => void;
  onRemove: (clientId: string) => void;
};

function ContactChannelSection({
  type,
  rows,
  onAdd,
  onUpdate,
  onRemove,
}: ContactChannelSectionProps) {
  const section = SECTION_CONFIG[type];
  const Icon = section.icon;

  return (
    <AdminFormSection
      title={section.title}
      description={section.description}
      icon={Icon}
      compact
      className="h-full"
    >
      <div className="space-y-3">
        {rows.length === 0 ? (
          <button
            type="button"
            onClick={onAdd}
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/40"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-sm font-medium text-slate-700">
              {section.addLabel}
            </span>
            <span className="text-xs text-slate-500">
              {adminCopy.contact.empty}
            </span>
          </button>
        ) : (
          <>
            {rows.map((row) => (
              <div
                key={row.clientId}
                className={cn(
                  "rounded-xl border p-2 transition-colors",
                  row.isActive
                    ? "border-slate-200 bg-white"
                    : "border-slate-200 bg-slate-50/80 opacity-80",
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-2">
                    <Icon
                      className="h-4 w-4 shrink-0 text-slate-400"
                      aria-hidden
                    />
                    <Input
                      id={`value-${row.clientId}`}
                      value={row.value}
                      onChange={(event) =>
                        onUpdate(row.clientId, { value: event.target.value })
                      }
                      placeholder={section.placeholder}
                      required
                      className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                      aria-label={adminCopy.contact.fields.value}
                    />
                  </div>

                  <label
                    className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-600"
                    title={adminCopy.contact.fields.active}
                  >
                    <input
                      type="checkbox"
                      checked={row.isActive}
                      onChange={(event) =>
                        onUpdate(row.clientId, {
                          isActive: event.target.checked,
                        })
                      }
                      className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="hidden sm:inline">
                      {adminCopy.contact.fields.active}
                    </span>
                  </label>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    onClick={() => onRemove(row.clientId)}
                    aria-label={adminCopy.contact.fields.remove}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onAdd}
            >
              <Plus className="h-4 w-4" aria-hidden />
              {section.addLabel}
            </Button>
          </>
        )}
      </div>
    </AdminFormSection>
  );
}

export function ContactSettingsForm({ channels }: ContactSettingsFormProps) {
  const router = useRouter();
  const [rows, setRows] = useState<ContactRowState[]>(
    channels.map(toRowState),
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const rowsByType = useMemo(() => {
    return CONTACT_CHANNEL_TYPES.reduce(
      (groups, type) => {
        groups[type] = rows.filter((row) => row.type === type);
        return groups;
      },
      {} as Record<ContactChannelType, ContactRowState[]>,
    );
  }, [rows]);

  const totalActive = useMemo(
    () => rows.filter((row) => row.isActive && row.value.trim()).length,
    [rows],
  );

  const updateRow = (
    clientId: string,
    patch: Partial<Pick<ContactRowState, "value" | "isActive">>,
  ) => {
    setRows((current) =>
      current.map((row) =>
        row.clientId === clientId ? { ...row, ...patch } : row,
      ),
    );
  };

  const removeRow = (clientId: string) => {
    setRows((current) => current.filter((row) => row.clientId !== clientId));
  };

  const addRow = (type: ContactChannelType) => {
    setRows((current) => [...current, createEmptyRow(type)]);
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

            const result = await updateContactChannelsAction({
              channels: rows.map((row) => ({
                id: row.id,
                type: row.type,
                value: row.value,
                isActive: row.isActive,
              })),
            });

            if (!result.success) {
              setError(translateAdminError(result.error.message));
              return;
            }

            setRows(result.data.map(toRowState));
            setSuccess(adminCopy.contact.saved);
            router.refresh();
          });
        }}
      >
        <div className="space-y-4 p-4 sm:p-5">
          {error ? <Alert variant="destructive">{error}</Alert> : null}
          {success ? <Alert>{success}</Alert> : null}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-900">
              {adminCopy.contact.formTitle}
            </p>
            <p className="text-xs text-muted-foreground">
              {adminCopy.contact.summary(rows.length, totalActive)}
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {CONTACT_CHANNEL_TYPES.map((type) => (
              <ContactChannelSection
                key={type}
                type={type}
                rows={rowsByType[type]}
                onAdd={() => addRow(type)}
                onUpdate={updateRow}
                onRemove={removeRow}
              />
            ))}
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            {adminCopy.contact.hint}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 px-4 py-3 sm:px-5">
          <p className="text-xs text-slate-500">{adminCopy.contact.saveHint}</p>
          <Button type="submit" disabled={isPending}>
            {isPending ? adminCopy.contact.saving : adminCopy.contact.save}
          </Button>
        </div>
      </form>
    </AdminContentCard>
  );
}
