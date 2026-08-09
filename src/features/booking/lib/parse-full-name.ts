export function formatFullName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

export function parseFullName(value: string): {
  firstName: string;
  lastName: string;
} {
  const trimmed = value.trim();

  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const spaceIndex = trimmed.indexOf(" ");

  if (spaceIndex === -1) {
    return { firstName: trimmed, lastName: "" };
  }

  return {
    firstName: trimmed.slice(0, spaceIndex),
    lastName: trimmed.slice(spaceIndex + 1).trim(),
  };
}
