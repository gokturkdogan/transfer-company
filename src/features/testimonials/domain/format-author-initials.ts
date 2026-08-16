export function formatAuthorInitials(firstName: string, lastName: string): string {
  const first = firstName.trim();
  const last = lastName.trim();

  if (!first && !last) {
    return "?";
  }

  if (!last) {
    return first.slice(0, 2).toUpperCase();
  }

  if (!first) {
    return last.slice(0, 2).toUpperCase();
  }

  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

export function formatAuthorFullName(firstName: string, lastName: string): string {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
}
