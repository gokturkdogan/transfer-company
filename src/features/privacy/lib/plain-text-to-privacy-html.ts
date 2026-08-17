function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function linkifyEscaped(text: string): string {
  return text
    .replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" rel="noopener noreferrer" target="_blank">$1</a>',
    )
    .replace(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '<a href="mailto:$1">$1</a>',
    )
    .replace(
      /(royalrheintransfers\.com)/gi,
      '<a href="https://royalrheintransfers.com" rel="noopener noreferrer" target="_blank">royalrheintransfers.com</a>',
    );
}

function formatLine(line: string): string {
  return linkifyEscaped(escapeHtml(line));
}

/**
 * Converts plain KVKK text (headings, bullets, separators) to safe HTML for the editor.
 */
export function plainTextToPrivacyHtml(text: string): string {
  const normalized = text.replace(/\u2060/g, "").trim();
  const lines = normalized.split("\n");
  const parts: string[] = [];
  const listItems: string[] = [];
  let headingIndex = 0;

  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }

    parts.push(
      `<ul>${listItems
        .map((item) => `<li>${formatLine(item)}</li>`)
        .join("")}</ul>`,
    );
    listItems.length = 0;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    if (line === "⸻" || line === "---") {
      flushList();
      parts.push("<hr />");
      continue;
    }

    if (line.startsWith("* ")) {
      listItems.push(line.slice(2));
      continue;
    }

    flushList();

    if (/^\d+\.\d+\.\s/.test(line)) {
      parts.push(`<h4>${formatLine(line)}</h4>`);
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      parts.push(`<h3>${formatLine(line)}</h3>`);
      continue;
    }

    if (headingIndex === 0) {
      parts.push(`<h1>${formatLine(line)}</h1>`);
      headingIndex += 1;
      continue;
    }

    if (headingIndex === 1) {
      parts.push(`<h2>${formatLine(line)}</h2>`);
      headingIndex += 1;
      continue;
    }

    parts.push(`<p>${formatLine(line)}</p>`);
  }

  flushList();

  return parts.join("");
}
