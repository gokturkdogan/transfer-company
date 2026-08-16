"use client";

import type { ComponentType, SVGProps } from "react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateSocialMediaLinksAction } from "@/features/admin/server/actions";
import type { SocialMediaLinkRecord } from "@/features/social-media/server/repository";
import { adminCopy, translateAdminError } from "@/features/admin/copy";
import { AdminContentCard } from "@/features/admin/components/shell/AdminContentCard";
import { AdminFormSection } from "@/features/admin/components/shell/AdminFormSection";
import type { SocialMediaPlatform } from "@/db/schema/enums";
import { SOCIAL_MEDIA_PLATFORMS } from "@/db/schema/enums";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/shared/social-icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SocialMediaSettingsFormProps = {
  links: SocialMediaLinkRecord[];
};

type LinkRowState = {
  platform: SocialMediaPlatform;
  url: string;
  isActive: boolean;
};

const PLATFORM_CONFIG: Record<
  SocialMediaPlatform,
  {
    label: string;
    placeholder: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
  }
> = {
  INSTAGRAM: {
    label: adminCopy.socialMedia.platforms.instagram,
    placeholder: adminCopy.socialMedia.placeholders.instagram,
    icon: InstagramIcon,
  },
  FACEBOOK: {
    label: adminCopy.socialMedia.platforms.facebook,
    placeholder: adminCopy.socialMedia.placeholders.facebook,
    icon: FacebookIcon,
  },
  X: {
    label: adminCopy.socialMedia.platforms.x,
    placeholder: adminCopy.socialMedia.placeholders.x,
    icon: XIcon,
  },
  YOUTUBE: {
    label: adminCopy.socialMedia.platforms.youtube,
    placeholder: adminCopy.socialMedia.placeholders.youtube,
    icon: YouTubeIcon,
  },
  TIKTOK: {
    label: adminCopy.socialMedia.platforms.tiktok,
    placeholder: adminCopy.socialMedia.placeholders.tiktok,
    icon: TikTokIcon,
  },
};

function toRowState(link: SocialMediaLinkRecord): LinkRowState {
  return {
    platform: link.platform,
    url: link.url,
    isActive: link.isActive,
  };
}

export function SocialMediaSettingsForm({ links }: SocialMediaSettingsFormProps) {
  const router = useRouter();
  const [rows, setRows] = useState<LinkRowState[]>(
    SOCIAL_MEDIA_PLATFORMS.map((platform) => {
      const existing = links.find((link) => link.platform === platform);
      return existing
        ? toRowState(existing)
        : { platform, url: "", isActive: false };
    }),
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeCount = useMemo(
    () => rows.filter((row) => row.isActive && row.url.trim()).length,
    [rows],
  );

  const updateRow = (
    platform: SocialMediaPlatform,
    patch: Partial<Pick<LinkRowState, "url" | "isActive">>,
  ) => {
    setRows((current) =>
      current.map((row) =>
        row.platform === platform ? { ...row, ...patch } : row,
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

            const result = await updateSocialMediaLinksAction({
              links: rows.map((row) => ({
                platform: row.platform,
                url: row.url,
                isActive: row.isActive,
              })),
            });

            if (!result.success) {
              setError(translateAdminError(result.error.message));
              return;
            }

            setRows(
              SOCIAL_MEDIA_PLATFORMS.map((platform) => {
                const saved = result.data.find(
                  (link) => link.platform === platform,
                );
                return saved ? toRowState(saved) : { platform, url: "", isActive: false };
              }),
            );
            setSuccess(adminCopy.socialMedia.saved);
            router.refresh();
          });
        }}
      >
        <div className="space-y-4 p-4 sm:p-5">
          {error ? <Alert variant="destructive">{error}</Alert> : null}
          {success ? <Alert>{success}</Alert> : null}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-900">
              {adminCopy.socialMedia.formTitle}
            </p>
            <p className="text-xs text-muted-foreground">
              {adminCopy.socialMedia.summary(activeCount, SOCIAL_MEDIA_PLATFORMS.length)}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {rows.map((row) => {
              const config = PLATFORM_CONFIG[row.platform];
              const Icon = config.icon;

              return (
                <AdminFormSection
                  key={row.platform}
                  title={config.label}
                  icon={Icon}
                  compact
                  className="h-full"
                >
                  <div
                    className={cn(
                      "space-y-3 rounded-xl border p-3 transition-colors",
                      row.isActive && row.url.trim()
                        ? "border-slate-200 bg-white"
                        : "border-slate-200 bg-slate-50/80",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-2">
                        <Icon
                          className="h-4 w-4 shrink-0 text-slate-400"
                          aria-hidden
                        />
                        <Input
                          value={row.url}
                          onChange={(event) =>
                            updateRow(row.platform, { url: event.target.value })
                          }
                          placeholder={config.placeholder}
                          className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                          aria-label={adminCopy.socialMedia.fields.url}
                        />
                      </div>

                      <label
                        className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-600"
                        title={adminCopy.socialMedia.fields.active}
                      >
                        <input
                          type="checkbox"
                          checked={row.isActive}
                          onChange={(event) =>
                            updateRow(row.platform, {
                              isActive: event.target.checked,
                            })
                          }
                          className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="hidden sm:inline">
                          {adminCopy.socialMedia.fields.active}
                        </span>
                      </label>
                    </div>
                  </div>
                </AdminFormSection>
              );
            })}
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            {adminCopy.socialMedia.hint}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 px-4 py-3 sm:px-5">
          <p className="text-xs text-slate-500">{adminCopy.socialMedia.saveHint}</p>
          <Button type="submit" disabled={isPending}>
            {isPending ? adminCopy.socialMedia.saving : adminCopy.socialMedia.save}
          </Button>
        </div>
      </form>
    </AdminContentCard>
  );
}
