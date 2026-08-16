export const FOOTER_BACKLINK_SLOT_COUNT = 3;

export const FOOTER_BACKLINK_SLOT_INDICES = [0, 1, 2] as const;

export type FooterBacklinkSlotIndex =
  (typeof FOOTER_BACKLINK_SLOT_INDICES)[number];
