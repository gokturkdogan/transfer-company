import { getTranslations } from "next-intl/server";

import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/shared/social-icons";
import type { SocialMediaPlatform } from "@/db/schema/enums";
import type { SocialMediaLinkRecord } from "@/features/social-media/server/repository";
import { cn } from "@/lib/utils";

const PLATFORM_ICONS: Record<
  SocialMediaPlatform,
  typeof InstagramIcon
> = {
  INSTAGRAM: InstagramIcon,
  FACEBOOK: FacebookIcon,
  X: XIcon,
  YOUTUBE: YouTubeIcon,
  TIKTOK: TikTokIcon,
};

type SocialMediaIconLinksProps = {
  links: SocialMediaLinkRecord[];
  size?: "md" | "sm";
  className?: string;
  listClassName?: string;
};

export async function SocialMediaIconLinks({
  links,
  size = "md",
  className,
  listClassName,
}: SocialMediaIconLinksProps) {
  if (links.length === 0) {
    return null;
  }

  const t = await getTranslations("about.social");

  const buttonSize = size === "sm" ? "h-10 w-10 rounded-xl" : "h-14 w-14 rounded-2xl";
  const iconSize = size === "sm" ? "h-5 w-5" : "h-6 w-6";

  return (
    <nav aria-label={t("title")} className={className}>
      <ul
        className={cn(
          "flex flex-wrap items-center gap-3",
          listClassName,
        )}
      >
        {links.map((link) => {
          const Icon = PLATFORM_ICONS[link.platform];
          const label = t(`platforms.${link.platform}`);

          return (
            <li key={link.platform}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={cn(
                  "group flex cursor-pointer items-center justify-center",
                  buttonSize,
                  "border border-white/12 bg-white/6 text-white/85 backdrop-blur-sm",
                  "transition-all duration-300 hover:border-gold/45 hover:bg-gold/12 hover:text-gold-light",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
                )}
              >
                <Icon
                  className={cn(
                    iconSize,
                    "transition-transform duration-300 group-hover:scale-110",
                  )}
                  aria-hidden
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
