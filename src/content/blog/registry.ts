import type { BlogPostDefinition } from "@/content/blog/types";

export function getTransferPathForPost(post: BlogPostDefinition): string | null {
  if (!post.transferDistrictCode) {
    return null;
  }

  return `/transfers/${post.transferDistrictCode.toLowerCase()}`;
}
