export function slugifyHotelName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildHotelCode(districtCode: string, name: string): string {
  const slug = slugifyHotelName(name).replace(/-/g, "_").toUpperCase();
  return `${districtCode}_${slug}`.slice(0, 64);
}
