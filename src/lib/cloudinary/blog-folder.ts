const BLOG_FOLDER_PREFIX = "Home/Blog";

export function buildBlogCoverFolderPath(slug: string): string {
  const normalizedSlug = slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!normalizedSlug) {
    throw new Error("Guide slug is required for cover upload");
  }

  return `${BLOG_FOLDER_PREFIX}/${normalizedSlug}`;
}
