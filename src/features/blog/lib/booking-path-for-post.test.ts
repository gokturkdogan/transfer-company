import { describe, expect, it } from "vitest";

import type { BlogPostDefinition } from "@/content/blog/types";
import type { DistrictDto } from "@/features/locations/types";
import {
  getBookingHrefForPost,
  resolveDistrictIdByCode,
} from "@/features/blog/lib/booking-path-for-post";

const districts: DistrictDto[] = [
  {
    id: "district-kemer",
    name: "Kemer",
    code: "KEMER",
    cityId: "city-1",
    sortOrder: 1,
  },
  {
    id: "district-lara",
    name: "Lara",
    code: "LARA",
    cityId: "city-1",
    sortOrder: 2,
  },
];

const postWithDistrict: BlogPostDefinition = {
  slug: "kemer-guide",
  publishedAt: "2026-01-15",
  coverImage: "https://example.com/cover.jpg",
  coverImageAlt: { tr: "Kemer" },
  transferDistrictCode: "kemer",
  content: {
    tr: {
      title: "Kemer",
      metaDescription: "Kemer transfer guide",
      excerpt: "Excerpt",
      readingMinutes: 5,
      intro: "Intro",
      sections: [],
    },
  },
};

describe("resolveDistrictIdByCode", () => {
  it("matches district codes case-insensitively", () => {
    expect(resolveDistrictIdByCode(districts, "kemer")).toBe("district-kemer");
    expect(resolveDistrictIdByCode(districts, "LARA")).toBe("district-lara");
  });

  it("returns null when code is unknown", () => {
    expect(resolveDistrictIdByCode(districts, "SIDE")).toBeNull();
  });
});

describe("getBookingHrefForPost", () => {
  it("returns booking deep link with district id when code resolves", () => {
    expect(getBookingHrefForPost(postWithDistrict, districts)).toEqual({
      pathname: "/booking",
      query: { district: "district-kemer" },
    });
  });

  it("returns null when post has no transfer district code", () => {
    const post: BlogPostDefinition = {
      ...postWithDistrict,
      transferDistrictCode: undefined,
    };

    expect(getBookingHrefForPost(post, districts)).toBeNull();
  });

  it("returns null when district code does not resolve", () => {
    const post: BlogPostDefinition = {
      ...postWithDistrict,
      transferDistrictCode: "side",
    };

    expect(getBookingHrefForPost(post, districts)).toBeNull();
  });
});
