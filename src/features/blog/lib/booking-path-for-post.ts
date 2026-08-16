import type { BlogPostDefinition } from "@/content/blog/types";
import type { DistrictDto } from "@/features/locations/types";

export type BookingHref = {
  pathname: "/booking";
  query: { district: string };
};

export function resolveDistrictIdByCode(
  districts: DistrictDto[],
  districtCode: string,
): string | null {
  const normalized = districtCode.trim().toUpperCase();
  const match = districts.find(
    (district) => district.code.toUpperCase() === normalized,
  );

  return match?.id ?? null;
}

export function getBookingHrefForPost(
  post: BlogPostDefinition,
  districts: DistrictDto[],
): BookingHref | null {
  if (!post.transferDistrictCode) {
    return null;
  }

  const districtId = resolveDistrictIdByCode(
    districts,
    post.transferDistrictCode,
  );

  if (!districtId) {
    return null;
  }

  return {
    pathname: "/booking",
    query: { district: districtId },
  };
}
